import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link, QrCode, Check, X, MoreVertical } from 'lucide-react';
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

  // Auto-generate QR code when opening menu
  const handleMenuOpen = async () => {
    setIsOpen(true);
    if (!qrCodeUrl) {
      try {
        const qrDataUrl = await QRCode.toDataURL(profileUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#ff4500',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCopied(false);
  };

  return (
    <>
      {/* Three Dots Menu Button */}
      <button
        onClick={handleMenuOpen}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Profil teilen"
      >
        <MoreVertical className="h-4 w-4 text-gray-600" />
      </button>

      {/* Fullscreen Share Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex flex-col items-center justify-center z-50">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 left-6 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* QR Code Container */}
          <div className="bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl">
            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <img 
                  src={qrCodeUrl} 
                  alt={`QR-Code für ${profileName}`}
                  className="w-48 h-48 rounded-2xl"
                />
                <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
                  @{profileName.toUpperCase().replace(' ', '.')}
                </h2>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl mx-6 mt-4 max-w-sm w-full shadow-2xl overflow-hidden">
            <button
              onClick={copyToClipboard}
              className="w-full px-6 py-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Link className="h-5 w-5 text-gray-700" />
              )}
              <span className={`font-medium ${copied ? 'text-green-600' : 'text-gray-700'}`}>
                {copied ? 'Kopiert!' : 'Link kopieren'}
              </span>
            </button>
            
            <button
              onClick={handleClose}
              className="w-full px-6 py-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
              <span className="font-medium text-gray-700">Profil teilen</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileShareMenu;