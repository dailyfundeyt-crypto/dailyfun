import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Edit, User, Mail, MapPin, Briefcase, Globe, Save, Eye, Calendar, Heart } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
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
        is_public: profile.is_public
      });
    }
    setIsEditing(false);
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
    // Profile View Mode
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-black">
        <InstallSidebar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 font-serif">Mein Profil</h1>
              <p className="text-gray-600">Dein öffentliches Profil</p>
            </div>
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Profil bearbeiten
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-400 text-white text-2xl font-bold">
                  {(formData.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold text-black mb-2">
                {formData.display_name || user?.email || 'Dein Name'}
              </h2>
              
              {formData.profession && (
                <p className="text-red-500 font-medium text-lg mb-3">
                  {formData.profession}
                </p>
              )}
              
              {formData.location && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>
              )}
            </div>
            
            <div className="p-8">
              {formData.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-2">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                </div>
              )}
              
              {formData.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-2">Über mich</h3>
                  <p className="text-gray-700 leading-relaxed">{formData.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {formData.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="h-4 w-4 text-red-500" />
                    <a 
                      href={formData.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-red-500 hover:underline font-medium"
                    >
                      Website besuchen
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>
                    {formData.is_public ? 'Öffentlich sichtbar' : 'Privat'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {!formData.is_public && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                💡 Dein Profil ist derzeit privat. Andere Nutzer können es nicht finden oder sehen.
              </AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-black">
      <InstallSidebar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2 font-serif">Profil bearbeiten</h1>
            <p className="text-gray-600">Bearbeite dein öffentliches Profil</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-gray-100">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="h-5 w-5 text-red-500" />
                  Profil Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-black font-medium">Anzeigename</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Dein vollständiger Name"
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-black font-medium">Kurze Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Erzähle in ein paar Worten über dich..."
                    rows={3}
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
                  />
                </div>

                {/* Profession */}
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-black font-medium">Beruf</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="z.B. Software Engineer, Designer, Student..."
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-black font-medium">Standort</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="z.B. Berlin, Deutschland"
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-black font-medium">Detaillierte Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Beschreibe deine Interessen, Erfahrungen und Expertise..."
                    rows={4}
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
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
                    className="border-gray-200 focus:border-red-300 focus:ring-red-100"
                  />
                </div>

                {/* Public Profile Toggle */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => handleInputChange('is_public', e.target.checked)}
                    className="h-4 w-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                  />
                  <Label htmlFor="is_public" className="text-black font-medium">
                    Profil öffentlich sichtbar machen
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-gray-100 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-black">Live Vorschau</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  {/* Profile Avatar */}
                  <Avatar className="w-16 h-16 mx-auto ring-2 ring-gray-200">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-400 text-white font-bold">
                      {(formData.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div>
                    <h3 className="font-bold text-lg text-black">
                      {formData.display_name || 'Dein Name'}
                    </h3>
                    {formData.profession && (
                      <p className="text-red-500 text-sm font-medium">
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
                    <p className="text-sm text-gray-700 text-left">
                      {formData.bio}
                    </p>
                  )}

                  {/* Website */}
                  {formData.website && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Globe className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">Website</span>
                    </div>
                  )}

                  {/* Public Status */}
                  <div className={`text-xs px-2 py-1 rounded-full ${formData.is_public ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {formData.is_public ? '✓ Öffentlich' : '🔒 Privat'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!formData.is_public && (
          <Alert className="mt-6 border-orange-200 bg-orange-50">
            <Heart className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              💡 Tipp: Aktiviere die öffentliche Sichtbarkeit, damit andere Nutzer dein Profil entdecken können!
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
};

export default ProfileManagement;