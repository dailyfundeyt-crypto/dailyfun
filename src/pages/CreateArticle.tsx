import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Loader2, ArrowLeft, Upload, X, Globe, Plus, Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import InstallSidebar from '../components/InstallSidebar';
import Auth from './Auth';
import { cn } from '@/lib/utils';

type Step = 'details' | 'post-elements' | 'preview' | 'visibility';

const CreateArticle = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [languages, setLanguages] = useState<string[]>(['de']);
  const [autoGenerateThumbnail, setAutoGenerateThumbnail] = useState(false);
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

  const steps: { id: Step; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'post-elements', label: 'Post Elemente' },
    { id: 'preview', label: 'Vorabprüfung' },
    { id: 'visibility', label: 'Sichtbarkeit' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

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

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setVideoUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/video-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      handleInputChange('video_url', publicUrl);
      toast.success('Video erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Fehler beim Hochladen des Videos');
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InstallSidebar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/weird')}
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Artikel veröffentlichen</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="apple-button bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 shadow-lg"
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

        {/* Progress Stepper */}
        <div className="mb-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center z-10 flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300",
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </button>
                  <span className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0"
                    style={{
                      left: `${(index + 0.5) * (100 / steps.length)}%`,
                      width: `${100 / steps.length}%`
                    }}
                  >
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: index < currentStepIndex ? '100%' : '0%'
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step: Details */}
        {currentStep === 'details' && (
          <div className="space-y-6 animate-fade-in">
            {/* Language Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Welche Sprachen soll dein Artikel haben?</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleLanguage('de')}
                  className={cn(
                    "apple-button px-6 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3",
                    languages.includes('de')
                      ? "border-primary bg-primary/5 text-primary shadow-md"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">DE</span>
                </button>
                <button
                  onClick={() => toggleLanguage('en')}
                  className={cn(
                    "apple-button px-6 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3",
                    languages.includes('en')
                      ? "border-primary bg-primary/5 text-primary shadow-md"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">EN</span>
                </button>
                <button
                  className="apple-button px-6 py-4 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/30 transition-all duration-200"
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-semibold">Details</h3>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Details wiederverwenden
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Thumbnail Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Thumbnail</Label>
                  <p className="text-sm text-muted-foreground">
                    Erstelle ein Thumbnail, das auffällt und Interesse bei den Zuschauern erzeugt.
                  </p>
                  
                  {!formData.image_url ? (
                    <div className="space-y-4">
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
                        className={cn(
                          "flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
                          uploading 
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-card hover:border-primary hover:bg-accent"
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                        <div className="text-center">
                          <p className="text-base font-medium">
                            {uploading ? 'Wird hochgeladen...' : 'Datei hochladen'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {uploading ? 'Bitte warten' : 'Ziehen Sie eine Datei hierher oder klicken Sie'}
                          </p>
                        </div>
                      </label>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-card text-muted-foreground">Oder</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setAutoGenerateThumbnail(!autoGenerateThumbnail)}
                        className={cn(
                          "apple-button w-full p-8 rounded-2xl border-2 border-dashed transition-all duration-200 group",
                          autoGenerateThumbnail
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary hover:bg-accent"
                        )}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Sparkles className={cn(
                            "h-8 w-8 transition-colors",
                            autoGenerateThumbnail ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          <span className={cn(
                            "text-base font-medium transition-colors",
                            autoGenerateThumbnail ? "text-primary" : "text-foreground"
                          )}>
                            Automatisch generiert
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-border">
                      <img 
                        src={formData.image_url} 
                        alt="Thumbnail" 
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        onClick={() => handleInputChange('image_url', '')}
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Category Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kategorie (Deutsch) *</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="z.B. Wissenschaft, Technology, Lifestyle..."
                      className="bg-background border-border rounded-xl"
                    />
                  </div>

                  {languages.includes('en') && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Kategorie (Englisch)</Label>
                      <Input
                        value={formData.category_en}
                        onChange={(e) => handleInputChange('category_en', e.target.value)}
                        placeholder="Optional: English category..."
                        className="bg-background border-border rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Video Uploaden</Label>
                  
                  {!formData.video_url ? (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="article-video-upload"
                        disabled={videoUploading}
                      />
                      <label
                        htmlFor="article-video-upload"
                        className={cn(
                          "flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
                          videoUploading
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-card hover:border-primary hover:bg-accent"
                        )}
                      >
                        {videoUploading ? (
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : (
                          <Video className="h-12 w-12 text-muted-foreground" />
                        )}
                        <div className="text-center">
                          <p className="text-base font-medium">
                            {videoUploading ? 'Video wird hochgeladen...' : 'Datei hochladen'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {videoUploading ? 'Bitte warten' : 'Ziehen Sie ein Video hierher oder klicken Sie'}
                          </p>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-border bg-muted">
                      <video 
                        src={formData.video_url} 
                        controls
                        className="w-full h-64"
                      />
                      <Button
                        onClick={() => handleInputChange('video_url', '')}
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Fields */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                {/* Title Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Titel (Deutsch) *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Gib deinem Artikel einen spannenden Titel..."
                      className="bg-background border-border rounded-xl text-base"
                    />
                  </div>

                  {languages.includes('en') && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Titel (Englisch)</Label>
                      <Input
                        value={formData.title_en}
                        onChange={(e) => handleInputChange('title_en', e.target.value)}
                        placeholder="Optional: English title..."
                        className="bg-background border-border rounded-xl text-base"
                      />
                    </div>
                  )}
                </div>

                {/* Excerpt Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Zusammenfassung (Deutsch) *</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Eine kurze Zusammenfassung für die Startseite..."
                      className="bg-background border-border rounded-xl min-h-[100px] resize-none"
                    />
                  </div>

                  {languages.includes('en') && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Zusammenfassung (Englisch)</Label>
                      <Textarea
                        value={formData.excerpt_en}
                        onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
                        placeholder="Optional: English excerpt..."
                        className="bg-background border-border rounded-xl min-h-[100px] resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Content Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Inhalt (Deutsch) *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Schreibe hier deinen Artikel..."
                      className="bg-background border-border rounded-xl min-h-[300px] resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Tipp: HTML-Tags werden unterstützt
                    </p>
                  </div>

                  {languages.includes('en') && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Inhalt (Englisch)</Label>
                      <Textarea
                        value={formData.content_en}
                        onChange={(e) => handleInputChange('content_en', e.target.value)}
                        placeholder="Optional: English content..."
                        className="bg-background border-border rounded-xl min-h-[300px] resize-none font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Publish Status */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is-published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked as boolean)}
                  className="rounded-md"
                />
                <label 
                  htmlFor="is-published" 
                  className="text-sm font-medium cursor-pointer select-none"
                >
                  Artikel sofort veröffentlichen
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setCurrentStep('post-elements')}
                className="apple-button bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 shadow-lg"
              >
                Weiter
              </Button>
            </div>
          </div>
        )}

        {/* Other steps would go here - for now just showing placeholder */}
        {currentStep !== 'details' && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center animate-fade-in">
            <p className="text-muted-foreground">
              Weitere Schritte werden hier angezeigt
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={() => setCurrentStep(steps[currentStepIndex - 1]?.id as Step)}
                variant="outline"
                className="rounded-xl"
              >
                Zurück
              </Button>
              <Button
                onClick={() => {
                  if (currentStepIndex < steps.length - 1) {
                    setCurrentStep(steps[currentStepIndex + 1]?.id as Step);
                  }
                }}
                className="apple-button bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                Weiter
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateArticle;