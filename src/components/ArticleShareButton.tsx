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
      className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg font-medium text-sm"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {language === 'de' ? 'Kopiert!' : 'Copied!'}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          {language === 'de' ? 'Teilen' : 'Share'}
        </>
      )}
    </button>
  );
};

export default ArticleShareButton;