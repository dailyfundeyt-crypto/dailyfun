import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import googleLogo from '@/assets/google-logo.png';
import dailyFunLogo from '@/assets/daily-fun-logo.png';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: t('auth.login.failed'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('auth.login.success'),
          description: t('auth.login.welcome'),
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: t('auth.login.failed'),
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: t('auth.signup.failed'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('auth.signup.success'),
          description: t('auth.signup.email.verify'),
        });
      }
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: t('auth.error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-40 h-40 mb-6 relative">
            <img 
              src={dailyFunLogo} 
              alt="Daily Fun Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-3">
            Welcome
          </h1>
          <p className="text-muted-foreground text-base">
            Sign in or create an account
          </p>
        </div>

        <Card className="shadow-xl border border-border bg-card">
          <CardContent className="pt-8 pb-8 px-8 space-y-6">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="apple-button w-full h-12 bg-background text-foreground border-2 border-border hover:bg-accent rounded-lg font-medium transition-all duration-200 ease-apple active:scale-95"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img src={googleLogo} alt="Google" className="mr-2 h-5 w-5" />
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-foreground font-semibold">Daily Fun / Conect</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Custom Tab Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`apple-button h-11 rounded-lg font-semibold transition-all duration-200 ease-apple active:scale-95 ${
                    activeTab === 'login'
                      ? 'bg-foreground text-background shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`apple-button h-11 rounded-lg font-semibold transition-all duration-200 ease-apple active:scale-95 ${
                    activeTab === 'signup'
                      ? 'bg-foreground text-background shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background border-2 border-border focus:border-foreground rounded-lg transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-background border-2 border-border focus:border-foreground rounded-lg transition-all duration-200 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="apple-button w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg shadow-lg transition-all duration-200 ease-apple active:scale-95 mt-2"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background border-2 border-border focus:border-foreground rounded-lg transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-background border-2 border-border focus:border-foreground rounded-lg transition-all duration-200 pr-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="apple-button w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg shadow-lg transition-all duration-200 ease-apple active:scale-95 mt-2"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Daily Fun © 2025
        </p>
      </div>
    </div>
  );
};

export default Auth;