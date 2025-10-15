import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

interface LanguageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLanguages: string[];
  onLanguageSelect: (languageCode: string) => void;
  title?: string;
  description?: string;
}

export const LanguageSelectionDialog = ({
  open,
  onOpenChange,
  selectedLanguages,
  onLanguageSelect,
  title = 'Sprache hinzufügen',
  description = 'Wähle eine oder mehrere Sprachen für deinen Artikel',
}: LanguageSelectionDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = AVAILABLE_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </DialogHeader>

        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Sprache suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 rounded-xl focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto px-4 py-2">
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => onLanguageSelect(lang.code)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl mb-2 transition-all duration-200',
                  'hover:bg-accent/50',
                  isSelected && 'bg-primary/5 border-2 border-primary'
                )}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <Globe className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-semibold text-base">{lang.nativeName}</div>
                  <div className="text-sm text-muted-foreground">{lang.name}</div>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                {!isSelected && (
                  <div className="w-10 h-10 rounded-full border-2 border-muted-foreground/30" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
