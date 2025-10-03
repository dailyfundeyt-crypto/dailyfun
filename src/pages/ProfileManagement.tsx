import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Edit, MapPin, Calendar, Heart, Upload, AtSign, Save, LogOut, Trash2 } from 'lucide-react';
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
  alias: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Note: email field removed for security - emails stored only in auth.users
}

const ProfileManagement = () => {
  const { user, loading: authLoading, signOut } = useAuth();
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
      
      const profileData = {
        user_id: user.id,
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        profession: formData.profession,
        description: formData.description,
        website: formData.website,
        alias: formData.alias,
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
    // Profile View Mode
    return (
      <div className="min-h-screen bg-white">
        <InstallSidebar />
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg text-gray-600">Live Vorschau</h1>
            <Button 
              onClick={handleEdit} 
              className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2"
            >
              <Edit className="h-4 w-4 mr-2" />
              Profil bearbeiten
            </Button>
          </div>

          {/* Profile Section */}
          <div className="text-center mb-8">
            {/* Avatar and Posts Counter */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gray-300 text-gray-600 text-2xl font-bold">
                  {(formData.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-black">0</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              
              {formData.location && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{formData.location}</span>
                </div>
              )}
            </div>
            
            {/* Name */}
            <h2 className="text-xl font-bold text-black mb-2">
              {formData.display_name || user?.email || 'Dein Name'}
            </h2>
            
            {/* Profession as Link */}
            {formData.profession && (
              <div className="mb-3">
                <a 
                  href={formData.website || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-500 hover:underline font-medium"
                >
                  {formData.profession}
                </a>
              </div>
            )}
            
            {/* Bio */}
            {formData.bio && (
              <p className="text-gray-700 mb-4 max-w-md mx-auto">
                {formData.bio}
              </p>
            )}
            
            {/* Website Link */}
            {formData.website && (
              <div className="mb-4">
                <a 
                  href={formData.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline text-sm"
                >
                  Website besuchen
                </a>
              </div>
            )}
            
            {/* Join Date */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
              <Calendar className="h-4 w-4" />
              <span>
                Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE', { 
                  day: 'numeric', 
                  month: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            {/* Follow Button (placeholder) */}
            <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 mb-8">
              <Heart className="h-4 w-4 mr-2 fill-current" />
              Gefolgt
            </Button>
          </div>

          {/* Latest Articles Section */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-black mb-2">Latest Articles</h3>
            <p className="text-gray-600 text-sm mb-6">by</p>
            
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-full p-1 flex">
                <button className="px-4 py-2 text-sm font-medium bg-white rounded-full shadow-sm text-black">
                  Latest Articles
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">
                  Random Articles
                </button>
              </div>
            </div>
            
            {/* No Articles Message */}
            <div className="py-16">
              <h4 className="text-lg font-semibold text-black mb-2">No articles found</h4>
              <p className="text-gray-500 text-sm">No articles by undefined.</p>
            </div>
          </div>

          {!formData.is_public && (
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">
                💡 Dein Profil ist derzeit privat. Andere Nutzer können es nicht finden oder sehen.
              </p>
            </div>
          )}
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