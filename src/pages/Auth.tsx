import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-red-100">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            {t('auth.welcome')}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-200"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="mr-2 h-5 w-5 text-red-500" />
            <span className="font-medium">{t('auth.google')}</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">{t('auth.or')}</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 p-1 bg-red-100">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm font-medium"
              >
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm font-medium"
              >
                {t('auth.signup')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    {t('auth.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-2 focus:border-red-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    {t('auth.password')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.password.placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-2 focus:border-red-400"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                  <label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                    {t('auth.email')}
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-2 focus:border-red-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
                    {t('auth.password')}
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('auth.password.placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-2 focus:border-red-400"
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
    </div>
  );
};

export default Auth;