import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateKeyPair, encryptMessage, decryptMessage } from '@/utils/cryptoUtils';
import { storeKeysLocally, getPrivateKey, hasKeys } from '@/utils/indexedDBHelper';
import { toast } from 'sonner';

export function useEncryption() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeEncryption();
    }
  }, [user]);

  const initializeEncryption = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Check if user already has keys locally
      const hasLocalKeys = await hasKeys(user.id);
      
      if (!hasLocalKeys) {
        // Generate new key pair
        console.log('Generating new encryption keys...');
        const keyPair = await generateKeyPair();
        
        // Store private key locally (never send to server!)
        await storeKeysLocally(user.id, keyPair.privateKey, keyPair.publicKey);
        
        // Store public key on server
        const { error } = await supabase
          .from('encryption_keys')
          .upsert({
            user_id: user.id,
            public_key: keyPair.publicKey,
          });

        if (error) throw error;
        
        console.log('Encryption keys generated and stored');
      } else {
        console.log('Using existing encryption keys');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing encryption:', error);
      toast.error('Verschlüsselung konnte nicht initialisiert werden');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientPublicKey = async (recipientId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('encryption_keys')
        .select('public_key')
        .eq('user_id', recipientId)
        .single();

      if (error) throw error;
      return data?.public_key || null;
    } catch (error) {
      console.error('Error fetching recipient public key:', error);
      return null;
    }
  };

  const encrypt = async (message: string, recipientId: string): Promise<string | null> => {
    try {
      const publicKey = await getRecipientPublicKey(recipientId);
      if (!publicKey) {
        console.error('Recipient public key not found');
        return null;
      }

      const encrypted = await encryptMessage(message, publicKey);
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  };

  const decrypt = async (encryptedMessage: string): Promise<string> => {
    if (!user) return '[Nicht angemeldet]';

    try {
      const privateKey = await getPrivateKey(user.id);
      if (!privateKey) {
        console.error('Private key not found');
        return '[Schlüssel nicht gefunden]';
      }

      const decrypted = await decryptMessage(encryptedMessage, privateKey);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Entschlüsselung fehlgeschlagen]';
    }
  };

  return {
    isInitialized,
    isLoading,
    encrypt,
    decrypt,
    getRecipientPublicKey,
  };
}
