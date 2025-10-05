import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import InstallSidebar from '../components/InstallSidebar';
import Auth from './Auth';

const CreateArticle = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    excerpt: '',
    excerpt_en: '',
    content: '',
    content_en: '',
    category: '',
    category_en: '',
    image_url: '',
    video_url: '',
    tags: [] as string[],
    is_published: true
  });
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/article-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      handleInputChange('image_url', publicUrl);
      toast.success('Bild erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
      toast.error('Bitte fülle alle Pflichtfelder aus (Titel, Zusammenfassung, Inhalt, Kategorie)');
      return;
    }

    try {
      setSaving(true);

      // Get user profile for author name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const articleData = {
        user_id: user.id,
        title: formData.title,
        title_en: formData.title_en || null,
        excerpt: formData.excerpt,
        excerpt_en: formData.excerpt_en || null,
        content: formData.content,
        content_en: formData.content_en || null,
        category: formData.category,
        category_en: formData.category_en || null,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        author_name: profileData.display_name || 'Unbekannt',
        is_published: formData.is_published
      };

      const { error } = await supabase
        .from('user_articles')
        .insert(articleData);

      if (error) throw error;

      toast.success('Artikel erfolgreich veröffentlicht!');
      navigate('/weird');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Fehler beim Veröffentlichen des Artikels');
    } finally {
      setSaving(false);
    }
  };

  // Show auth page if user is not logged in
  if (!authLoading && !user) {
    return <Auth />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <InstallSidebar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/weird')}
              variant="ghost"
              className="text-gray-600 hover:text-black p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-black">Artikel veröffentlichen</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Veröffentlichen...
              </>
            ) : (
              'Veröffentlichen'
            )}
          </Button>
        </div>

        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          {/* Title (German) */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Titel (Deutsch) *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Gib deinem Artikel einen spannenden Titel..."
              className="bg-white border-gray-300"
            />
          </div>

          {/* Title (English) */}
          <div className="space-y-2">
            <Label className="text-gray-600 font-medium">Titel (Englisch)</Label>
            <Input
              value={formData.title_en}
              onChange={(e) => handleInputChange('title_en', e.target.value)}
              placeholder="Optional: English title..."
              className="bg-white border-gray-300"
            />
          </div>

          {/* Excerpt (German) */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Zusammenfassung (Deutsch) *</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Eine kurze Zusammenfassung für die Startseite..."
              className="bg-white border-gray-300 min-h-[100px]"
            />
          </div>

          {/* Excerpt (English) */}
          <div className="space-y-2">
            <Label className="text-gray-600 font-medium">Zusammenfassung (Englisch)</Label>
            <Textarea
              value={formData.excerpt_en}
              onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
              placeholder="Optional: English excerpt..."
              className="bg-white border-gray-300 min-h-[100px]"
            />
          </div>

          {/* Content (German) */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Inhalt (Deutsch) *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Schreibe hier deinen Artikel... Du kannst HTML-Tags verwenden und Bilder mit <img> einbinden."
              className="bg-white border-gray-300 min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              💡 Tipp: Verwende HTML für Formatierung. Beispiel für Bilder: 
              {' '}<code className="bg-gray-200 px-1 rounded">&lt;img src="URL" alt="Beschreibung" style="width: 300px; height: 200px; object-fit: cover; margin: 16px 0; border-radius: 8px;" /&gt;</code>
            </p>
          </div>

          {/* Content (English) */}
          <div className="space-y-2">
            <Label className="text-gray-600 font-medium">Inhalt (Englisch)</Label>
            <Textarea
              value={formData.content_en}
              onChange={(e) => handleInputChange('content_en', e.target.value)}
              placeholder="Optional: English content..."
              className="bg-white border-gray-300 min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Titelbild</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="article-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="article-image-upload"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="text-sm">{uploading ? 'Hochladen...' : 'Bild hochladen'}</span>
              </label>
              {formData.image_url && (
                <div className="flex items-center gap-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                  />
                  <Button
                    onClick={() => handleInputChange('image_url', '')}
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Video URL</Label>
            <Input
              value={formData.video_url}
              onChange={(e) => handleInputChange('video_url', e.target.value)}
              placeholder="Optional: URL zum Video..."
              className="bg-white border-gray-300"
            />
          </div>

          {/* Category (German) */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Kategorie (Deutsch) *</Label>
            <Input
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="z.B. Wissenschaft, Technology, Lifestyle..."
              className="bg-white border-gray-300"
            />
          </div>

          {/* Category (English) */}
          <div className="space-y-2">
            <Label className="text-gray-600 font-medium">Kategorie (Englisch)</Label>
            <Input
              value={formData.category_en}
              onChange={(e) => handleInputChange('category_en', e.target.value)}
              placeholder="Optional: English category..."
              className="bg-white border-gray-300"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-black font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tag hinzufügen..."
                className="bg-white border-gray-300 flex-1"
              />
              <Button
                onClick={handleAddTag}
                type="button"
                variant="outline"
                className="px-4"
              >
                Hinzufügen
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-2 p-4 bg-white rounded-lg">
            <input
              type="checkbox"
              id="is-published"
              checked={formData.is_published}
              onChange={(e) => handleInputChange('is_published', e.target.checked)}
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
            />
            <label htmlFor="is-published" className="text-sm font-medium text-black">
              Artikel sofort veröffentlichen
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateArticle;