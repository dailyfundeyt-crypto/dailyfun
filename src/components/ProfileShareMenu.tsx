import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link, QrCode, Check, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';

interface ProfileShareMenuProps {
  profileName: string;
  profileId: string;
}

const ProfileShareMenu: React.FC<ProfileShareMenuProps> = ({ profileName, profileId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate profile URL
  const profileUrl = `${window.location.origin}/search?profile=${profileId}`;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowQR(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate QR Code
  const generateQRCode = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "QR-Code konnte nicht generiert werden.",
        variant: "destructive",
      });
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link kopiert!",
        description: "Der Profil-Link wurde in die Zwischenablage kopiert.",
      });
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Share Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
        title="Profil teilen"
      >
        <Share2 className="h-4 w-4 text-gray-600 group-hover:text-red-accent transition-colors" />
      </button>

      {/* Share Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-50">
          {!showQR ? (
            <>
              {/* Copy Link Option */}
              <button
                onClick={copyToClipboard}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Link className="h-4 w-4 text-gray-600" />
                )}
                <span className={`text-sm ${copied ? 'text-green-600' : 'text-gray-700'}`}>
                  {copied ? 'Kopiert!' : 'Link kopieren'}
                </span>
              </button>

              {/* Generate QR Code Option */}
              <button
                onClick={generateQRCode}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <QrCode className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">QR-Code generieren</span>
              </button>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">QR-Code für {profileName}</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
                
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR-Code für ${profileName}`}
                      className="border border-gray-200 rounded"
                    />
                  </div>
                )}
                
                <p className="text-xs text-gray-600 text-center mt-2">
                  Scannen Sie diesen Code, um das Profil zu öffnen
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileShareMenu;