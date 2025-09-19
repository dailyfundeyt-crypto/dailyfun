import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Camera, User, Mail, MapPin, Briefcase, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';
import InstallSidebar from '../components/InstallSidebar';
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
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const ProfileManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    profession: '',
    description: '',
    website: '',
    is_public: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const profileData = {
        user_id: user.id,
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        profession: formData.profession,
        description: formData.description,
        website: formData.website,
        is_public: formData.is_public,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profil erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Fehler beim Speichern des Profils');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-white text-black">
      <InstallSidebar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 font-serif">Mein Profil</h1>
          <p className="text-gray-600">Erstelle und verwalte dein öffentliches Profil</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil bearbeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name">Anzeigename</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Dein Name"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Erzähle etwas über dich..."
                    rows={3}
                  />
                </div>

                {/* Profession */}
                <div className="space-y-2">
                  <Label htmlFor="profession">Beruf</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="Dein Beruf"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Standort</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Stadt, Land"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detaillierte Beschreibung deiner Interessen und Expertise..."
                    rows={4}
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://deine-website.de"
                  />
                </div>

                {/* Public Profile Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => handleInputChange('is_public', e.target.checked)}
                    className="h-4 w-4 text-red-accent"
                  />
                  <Label htmlFor="is_public">Profil öffentlich sichtbar machen</Label>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Profil speichern
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {/* Profile Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Name */}
                  <div>
                    <h3 className="font-bold text-lg">
                      {formData.display_name || 'Dein Name'}
                    </h3>
                    {formData.profession && (
                      <p className="text-red-accent text-sm font-medium">
                        {formData.profession}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  {formData.location && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {formData.location}
                    </div>
                  )}

                  {/* Bio */}
                  {formData.bio && (
                    <p className="text-sm text-gray-700">
                      {formData.bio}
                    </p>
                  )}

                  {/* Website */}
                  {formData.website && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Globe className="h-4 w-4" />
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-red-accent hover:underline">
                        Website
                      </a>
                    </div>
                  )}

                  {/* Public Status */}
                  <div className="text-xs text-gray-500">
                    {formData.is_public ? 'Öffentlich sichtbar' : 'Privat'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!formData.is_public && (
          <Alert className="mt-6">
            <AlertDescription>
              Dein Profil ist derzeit privat. Aktiviere "Profil öffentlich sichtbar machen", damit andere Nutzer dein Profil finden können.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
};

export default ProfileManagement;