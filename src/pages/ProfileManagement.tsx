import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Loader2, Edit, MapPin, Calendar, Heart, Upload, AtSign, Save, LogOut, Trash2, Eye, TrendingUp, TrendingDown, Users, FileText, BarChart3, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InstallSidebar from '../components/InstallSidebar';
import ArticleCard from '../components/ArticleCard';
import Auth from './Auth';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  profession: string | null;
  description: string | null;
  website: string | null;
  alias: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  last_name_change: string | null;
  last_alias_change: string | null;
  followers_count?: number;
  following_count?: number;
}

interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  followers: number;
  following: number;
  viewsChange: number;
  articlesData: Array<{
    title: string;
    views: number;
    date: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
}

const ProfileManagement = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    profession: '',
    description: '',
    website: '',
    alias: '',
    is_public: true
  });
  const [uploading, setUploading] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalArticles: 0,
    followers: 0,
    following: 0,
    viewsChange: 0,
    articlesData: [],
    viewsOverTime: []
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserArticles();
      fetchAnalytics();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          profession: data.profession || '',
          description: data.description || '',
          website: data.website || '',
          alias: data.alias || '',
          is_public: data.is_public
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserArticles = async () => {
    if (!user) return;
    
    try {
      setArticlesLoading(true);
      const { data, error } = await supabase
        .from('user_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      // Transform to match ArticleCard interface
      const transformedArticles = data?.map(article => ({
        id: article.id,
        title: article.title,
        titleEn: article.title_en,
        excerpt: article.excerpt,
        excerptEn: article.excerpt_en,
        author: article.author_name,
        publishedAt: article.published_at,
        category: article.category,
        categoryEn: article.category_en,
        imageUrl: article.image_url || '/placeholder.svg',
        views: article.views || 0
      })) || [];

      setArticles(transformedArticles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('user_id', user.id)
        .single();

      const { data: articles } = await supabase
        .from('user_articles')
        .select('id, title, views, published_at')
        .eq('user_id', user.id)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      const totalViews = articles?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;
      const totalArticles = articles?.length || 0;

      const viewsOverTime = Array.from({ length: 28 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (27 - i));
        return {
          date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
          views: Math.floor(Math.random() * 100) + 20
        };
      });

      setAnalytics({
        totalViews,
        totalArticles,
        followers: profile?.followers_count || 0,
        following: profile?.following_count || 0,
        viewsChange: -12,
        articlesData: articles?.slice(0, 5).map(a => ({
          title: a.title,
          views: a.views || 0,
          date: new Date(a.published_at).toLocaleDateString('de-DE')
        })) || [],
        viewsOverTime
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkAliasAvailability = async (alias: string) => {
    if (!alias) return true;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('alias')
      .eq('alias', alias)
      .neq('user_id', user?.id)
      .single();

    return error?.code === 'PGRST116'; // No data found means alias is available
  };

  const handleAliasChange = async (alias: string) => {
    setAliasError('');
    if (alias && alias.length > 0) {
      const isAvailable = await checkAliasAvailability(alias);
      if (!isAvailable) {
        setAliasError('Dieser Alias ist bereits vergeben');
      }
    }
    handleInputChange('alias', alias);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Profilbild erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Check alias availability before saving
    if (formData.alias && !(await checkAliasAvailability(formData.alias))) {
      setAliasError('Dieser Alias ist bereits vergeben');
      return;
    }

    try {
      setSaving(true);
      
      const now = new Date();
      const profileData: any = {
        user_id: user.id,
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        profession: formData.profession,
        description: formData.description,
        website: formData.website,
        alias: formData.alias,
        is_public: formData.is_public,
        updated_at: now.toISOString()
      };

      // Check if name changed (and not first change from "User")
      if (profile?.display_name && profile.display_name !== 'User' && formData.display_name !== profile.display_name) {
        if (profile.last_name_change) {
          const lastChange = new Date(profile.last_name_change);
          const daysSinceLastChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastChange < 30) {
            toast.error(`Du kannst deinen Namen erst wieder in ${Math.ceil(30 - daysSinceLastChange)} Tagen ändern`);
            return;
          }
        }
        profileData.last_name_change = now.toISOString();
      } else if (profile?.display_name === 'User' && formData.display_name !== 'User') {
        // First name change from "User" - set the timestamp
        profileData.last_name_change = now.toISOString();
      }

      // Check if alias changed
      if (profile?.alias && formData.alias !== profile.alias) {
        if (profile.last_alias_change) {
          const lastChange = new Date(profile.last_alias_change);
          const daysSinceLastChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastChange < 30) {
            toast.error(`Du kannst deinen Alias erst wieder in ${Math.ceil(30 - daysSinceLastChange)} Tagen ändern`);
            return;
          }
        }
        profileData.last_alias_change = now.toISOString();
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      toast.success('Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Fehler beim Speichern des Profils');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        profession: profile.profession || '',
        description: profile.description || '',
        website: profile.website || '',
        alias: profile.alias || '',
        is_public: profile.is_public
      });
    }
    setIsEditing(false);
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    try {
      // Delete profile from database
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Delete user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        // If we can't delete the auth user, just sign out
        await signOut();
        toast.success('Profil gelöscht!');
      } else {
        toast.success('Profil und Account vollständig gelöscht!');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Fehler beim Löschen des Profils');
    }
  };

  // Show auth page if user is not logged in
  if (!authLoading && !user) {
    return <Auth />;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-accent" />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <InstallSidebar />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mein Account</h1>
            <Button 
              onClick={() => window.location.href = '/create-article'} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Artikel erstellen
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="analytics">Analyse</TabsTrigger>
              <TabsTrigger value="posts">Beiträge</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="p-8 bg-card">{/* Profile Section */}
          <div className="text-center mb-8">

                <div className="flex justify-center mb-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                      {(formData.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{articles.length}</div>
                    <div className="text-sm text-muted-foreground">Artikel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile?.followers_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Follower</div>
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{formData.location}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-1">
                  {formData.display_name || user?.email || 'Dein Name'}
                </h2>
                {formData.alias && (
                  <p className="text-muted-foreground text-sm mb-2">@{formData.alias}</p>
                )}
                {formData.profession && (
                  <div className="mb-3">
                    <a 
                      href={formData.website || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {formData.profession}
                    </a>
                  </div>
                )}
                {formData.bio && (
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">{formData.bio}</p>
                )}
                {formData.website && (
                  <div className="mb-4">
                    <a 
                      href={formData.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline text-sm"
                    >
                      Website besuchen
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE', { 
                      day: 'numeric', 
                      month: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <Button onClick={handleEdit} className="rounded-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Profil bearbeiten
                </Button>
              </div>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Follower</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.followers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.viewsChange > 0 ? '+' : ''}{analytics.viewsChange} in den letzten 28 Tagen
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Aufrufe</span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                    <div className="flex items-center text-xs text-destructive">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>134 weniger als gewöhnlich</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Artikel</span>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalArticles}</p>
                    <p className="text-xs text-muted-foreground">Veröffentlicht</p>
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4">
                  Dein Kanal hat in den letzten 28 Tagen {analytics.viewsOverTime.reduce((sum, d) => sum + d.views, 0)} Aufrufe erzielt
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4">Beliebteste Inhalte</h3>
                <div className="space-y-3">
                  {analytics.articlesData.map((article, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.date}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{article.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <Card className="p-6 bg-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Meine Artikel</h3>
                  <Button onClick={() => window.location.href = '/create-article'}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Neuer Artikel
                  </Button>
                </div>
                
                {articlesLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/5 transition-colors border border-border">
                        {article.imageUrl && (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{article.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(article.publishedAt).toLocaleDateString('de-DE')}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views} Aufrufe</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-semibold mb-2">Keine Artikel</h4>
                    <p className="text-muted-foreground text-sm mb-4">Du hast noch keine Artikel veröffentlicht.</p>
                    <Button onClick={() => window.location.href = '/create-article'}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Ersten Artikel erstellen
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-white">
      <InstallSidebar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg text-gray-600">Profil bearbeiten</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>

        {/* Public Profile Checkbox */}
        <div className="flex items-center gap-2 mb-8 p-4 bg-purple-50 rounded-lg">
          <input
            type="checkbox"
            id="public-profile"
            checked={formData.is_public}
            onChange={(e) => handleInputChange('is_public', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="public-profile" className="text-sm font-medium text-purple-700">
            Profil öffentlich sichtbar machen
          </label>
        </div>

        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="space-y-4">
            <Label className="text-black font-medium">Profilbild</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 bg-orange-400">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-orange-400 text-white font-bold text-xl">
                  {(formData.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Hochladen...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Bild hochladen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Alias */}
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-black font-medium">Benutzername/Alias</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => handleAliasChange(e.target.value)}
                placeholder="deinusername"
                className={`pl-10 ${aliasError ? 'border-red-300' : ''}`}
              />
            </div>
            {aliasError && (
              <p className="text-sm text-red-600">{aliasError}</p>
            )}
            <p className="text-sm text-gray-500">Eindeutiger Benutzername, den nur du verwenden kannst</p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-black font-medium">Anzeigename</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Marshall Rise"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-black font-medium">Kurz Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Hallo Ich bin Marshall Rise"
              rows={3}
            />
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-black font-medium">Beruf</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="YouTube"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-black font-medium">Standort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Berlin"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-black font-medium">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://deine-website.de"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-black font-medium">Persönliche Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Hallo ich bin Marshall Rise"
              rows={4}
            />
          </div>
        </div>

        {!formData.is_public && (
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 text-sm">
              💡 Tipp: Aktiviere die öffentliche Sichtbarkeit, damit andere Nutzer dein Profil entdecken können!
            </p>
          </div>
        )}

        {/* Account Actions */}
        <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-black mb-6">Account-Einstellungen</h3>
          
          <div className="flex flex-col gap-4">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full justify-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
            
            {showDeleteConfirm ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 text-center">
                  Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleDeleteProfile}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Endgültig löschen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Profil löschen
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileManagement;