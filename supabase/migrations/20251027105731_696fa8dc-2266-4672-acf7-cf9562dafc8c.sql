-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ai_credits INTEGER NOT NULL DEFAULT 0,
  image_upload_limit INTEGER NOT NULL DEFAULT 0,
  has_ad_free BOOLEAN NOT NULL DEFAULT false,
  has_video_player BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  ai_credits_remaining INTEGER NOT NULL DEFAULT 0,
  images_uploaded INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (everyone can read plans)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

-- RLS Policies for user_subscriptions (users can only see their own subscription)
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert Free and Pro plans
INSERT INTO public.subscription_plans (name, price, ai_credits, image_upload_limit, has_ad_free, has_video_player)
VALUES 
  ('Free', 0, 100, 10, false, false),
  ('Pro', 9.99, 1000, 50, true, true)
ON CONFLICT DO NOTHING;

-- Create function to check if user has active pro subscription
CREATE OR REPLACE FUNCTION public.has_active_pro_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
      AND us.is_active = true
      AND sp.name = 'Pro'
      AND (us.expires_at IS NULL OR us.expires_at > now())
  );
$$;

-- Create function to get user's remaining AI credits
CREATE OR REPLACE FUNCTION public.get_user_ai_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ai_credits_remaining 
     FROM public.user_subscriptions 
     WHERE user_id = p_user_id AND is_active = true),
    0
  );
$$;

-- Create function to deduct AI credits
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT ai_credits_remaining INTO v_credits
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Check if user has enough credits
  IF v_credits IS NULL OR v_credits < p_amount THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_subscriptions
  SET ai_credits_remaining = ai_credits_remaining - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id AND is_active = true;
  
  RETURN true;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();