-- Update Pro plan price to 2.99 Euro
UPDATE public.subscription_plans
SET price = 2.99
WHERE name = 'Pro';