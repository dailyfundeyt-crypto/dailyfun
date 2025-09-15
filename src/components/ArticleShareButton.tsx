import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ArticleShareButtonProps {
  articleId: string;
  title: string;
}

const ArticleShareButton: React.FC<ArticleShareButtonProps> = ({ articleId, title }) => {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();

  const shareUrl = `${window.location.origin}/article/${articleId}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // Fallback to clipboard on error
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="apple-toggle inline-flex items-center justify-center px-3 py-2.5 min-w-[100px] sm:min-w-[120px] bg-background/80 backdrop-blur-md border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-xl hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-300 ease-apple-spring rounded-xl font-medium text-sm whitespace-nowrap"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 animate-scale-in" />
          <span className="animate-fade-in">{language === 'de' ? 'Kopiert!' : 'Copied!'}</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          <span>{language === 'de' ? 'Teilen' : 'Share'}</span>
        </>
      )}
    </button>
  );
};

export default ArticleShareButton;