import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Chrome } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg mb-6">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            {t('auth.welcome')}
          </h1>
          <p className="text-gray-600">
            {t('auth.subtitle')}
          </p>
        </div>

        <Card className="shadow-xl border border-gray-200">
          <CardContent className="pt-6 space-y-6">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 border-black hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              <span>{t('auth.google')}</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('auth.or')}</span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-black data-[state=active]:text-white font-medium rounded-md"
                >
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-black data-[state=active]:text-white font-medium rounded-md"
                >
                  {t('auth.signup')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-black">
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.email.placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-black">
                      {t('auth.password')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth.password.placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-black"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-black text-white hover:bg-gray-800 font-semibold transition-all duration-200 rounded-md shadow-lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.login.button')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-black">
                      {t('auth.email')}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.email.placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-black">
                      {t('auth.password')}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('auth.password.placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-black"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-black text-white hover:bg-gray-800 font-semibold transition-all duration-200 rounded-md shadow-lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signup.button')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Daily Fun © 2025
        </p>
      </div>
    </div>
  );
};

export default Auth;