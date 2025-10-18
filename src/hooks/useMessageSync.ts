import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  storeMessageLocally, 
  getLocalMessages, 
  deleteLocalMessage,
  storeAttachmentLocally,
  getLocalAttachment,
  deleteLocalAttachment
} from '@/utils/indexedDBHelper';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'pdf' | 'article';
  attachment_url?: string | null;
  article_data?: any;
  created_at: string;
  is_read: boolean;
  delivered_at?: string | null;
}

export function useMessageSync() {
  /**
   * Load messages: Merge local + server messages
   */
  const loadMessages = useCallback(async (conversationId: string, userId: string) => {
    // Load local messages first (instant)
    const localMessages = await getLocalMessages(conversationId);
    
    // Load undelivered messages from server
    const { data: serverMessages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('delivered_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching server messages:', error);
      return localMessages.map(msg => ({
        ...msg,
        conversation_id: msg.conversationId,
        sender_id: msg.senderId,
        message_type: msg.messageType,
        attachment_url: msg.attachmentUrl,
        article_data: msg.articleData,
        created_at: msg.createdAt,
        is_read: msg.isRead,
      }));
    }

    // Merge: local messages + new server messages
    const allMessages: Message[] = localMessages.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversationId,
      sender_id: msg.senderId,
      content: msg.content,
      message_type: msg.messageType,
      attachment_url: msg.attachmentUrl,
      article_data: msg.articleData,
      created_at: msg.createdAt,
      is_read: msg.isRead,
    }));

    // Add server messages that aren't already local
    if (serverMessages) {
      for (const serverMsg of serverMessages) {
        if (!allMessages.find(m => m.id === serverMsg.id)) {
          allMessages.push({
            ...serverMsg,
            message_type: serverMsg.message_type || 'text',
          } as Message);
        }
      }
    }

    // Sort by date
    allMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return allMessages;
  }, []);

  /**
   * Save message locally and delete from server after delivery
   */
  const saveAndDeleteFromServer = useCallback(async (
    message: Message, 
    decryptedContent: string
  ) => {
    try {
      // Save locally
      await storeMessageLocally({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: decryptedContent,
        messageType: (message.message_type || 'text') as 'text' | 'image' | 'pdf' | 'article',
        attachmentUrl: message.attachment_url || undefined,
        articleData: message.article_data,
        createdAt: message.created_at,
        isRead: message.is_read,
      });

      // Download and save attachment if exists
      if (message.attachment_url) {
        await downloadAndStoreAttachment(message.attachment_url);
        
        // Delete from Supabase Storage
        const pathParts = message.attachment_url.split('/message-attachments/');
        if (pathParts[1]) {
          await supabase.storage
            .from('message-attachments')
            .remove([pathParts[1]]);
        }
      }

      // Mark as delivered and delete from server
      await supabase
        .from('messages')
        .delete()
        .eq('id', message.id);

      console.log('Message saved locally and deleted from server:', message.id);
    } catch (error) {
      console.error('Error in saveAndDeleteFromServer:', error);
    }
  }, []);

  /**
   * Download attachment and store as blob
   */
  const downloadAndStoreAttachment = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await storeAttachmentLocally(url, blob);
      console.log('Attachment downloaded and stored locally');
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  /**
   * Get local attachment as object URL
   */
  const getAttachmentUrl = useCallback(async (url: string): Promise<string> => {
    const blob = await getLocalAttachment(url);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return url; // Fallback to original URL
  }, []);

  /**
   * Delete message locally (manual deletion by user)
   */
  const deleteMessageLocally = useCallback(async (messageId: string, attachmentUrl?: string) => {
    try {
      await deleteLocalMessage(messageId);
      if (attachmentUrl) {
        await deleteLocalAttachment(attachmentUrl);
      }
      console.log('Message deleted locally:', messageId);
    } catch (error) {
      console.error('Error deleting message locally:', error);
    }
  }, []);

  return {
    loadMessages,
    saveAndDeleteFromServer,
    getAttachmentUrl,
    deleteMessageLocally,
  };
}
