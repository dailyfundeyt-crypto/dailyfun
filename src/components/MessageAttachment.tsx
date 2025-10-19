import React from 'react';
import { useMessageSync } from '@/hooks/useMessageSync';
import { hasDirectoryAccess, readFileFromLocalDirectory } from '@/utils/fileSystemStorage';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageAttachmentProps {
  url: string;
  type: 'image' | 'pdf';
  isOwn?: boolean;
  className?: string;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({ 
  url, 
  type, 
  isOwn = false,
  className 
}) => {
  const { getAttachmentUrl } = useMessageSync();
  const [displayUrl, setDisplayUrl] = React.useState<string>(url);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let objectUrl: string | undefined;

    const load = async () => {
      try {
        setLoading(true);
        
        // Try local directory first if available
        const hasAccess = await hasDirectoryAccess();
        console.log('Loading attachment, hasAccess:', hasAccess);
        
        if (hasAccess) {
          const fileName = url.split('/').pop();
          if (fileName) {
            try {
              console.log('Trying to read from local directory:', fileName);
              const localFile = await readFileFromLocalDirectory(fileName);
              if (localFile) {
                objectUrl = URL.createObjectURL(localFile);
                setDisplayUrl(objectUrl);
                console.log('✓ Loaded from local directory:', fileName);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.warn('Failed to read from local directory:', e);
            }
          }
        }

        // Try IndexedDB next
        try {
          console.log('Trying IndexedDB...');
          const idbUrl = await getAttachmentUrl(url);
          if (idbUrl && idbUrl !== url) {
            setDisplayUrl(idbUrl);
            console.log('✓ Loaded from IndexedDB');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to load from IndexedDB:', e);
        }

        // Fallback to original URL
        console.log('Using original URL as fallback');
        setDisplayUrl(url);
        setLoading(false);
      } catch (e) {
        console.error('Error loading attachment:', e);
        setDisplayUrl(url);
        setLoading(false);
      }
    };

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, getAttachmentUrl]);

  if (type === 'image') {
    return (
      <div className="max-w-[75%]">
        <img
          src={displayUrl}
          loading="lazy"
          alt="Geteiltes Bild"
          className={className || "rounded-2xl max-h-80 object-cover shadow-md cursor-pointer"}
          onClick={() => window.open(displayUrl, '_blank')}
          style={{ opacity: loading ? 0.5 : 1 }}
        />
      </div>
    );
  }

  // PDF
  return (
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 ${
        isOwn
          ? 'bg-primary text-white'
          : 'bg-white text-black border border-gray-100'
      }`}
    >
      <FileText className="h-10 w-10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">PDF-Dokument</p>
        <Button
          size="sm"
          variant={isOwn ? 'secondary' : 'default'}
          onClick={() => window.open(displayUrl, '_blank')}
          className="mt-2 gap-2"
          disabled={loading}
        >
          <ExternalLink className="h-3 w-3" />
          {loading ? 'Lädt...' : 'Öffnen'}
        </Button>
      </div>
    </div>
  );
};

export default MessageAttachment;
