import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, FileText, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  message_type?: 'text' | 'image' | 'pdf' | 'article';
  attachment_url?: string | null;
  article_data?: {
    id: string;
    title: string;
    excerpt: string;
    image_url?: string;
    category: string;
  } | null;
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canSendMedia, setCanSendMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      toast.error('Bitte melden Sie sich an');
      navigate('/auth');
      return;
    }
    initializeChat();
  }, [user, recipientId]);

  const initializeChat = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Find or create conversation
      const userOne = user.id < recipientId ? user.id : recipientId;
      const userTwo = user.id < recipientId ? recipientId : user.id;

      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_one_id', userOne)
        .eq('user_two_id', userTwo)
        .single();

      if (convError && convError.code !== 'PGRST116') {
        throw convError;
      }

      if (!conversation) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_one_id: userOne,
            user_two_id: userTwo,
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConv;
      }

      setConversationId(conversation.id);
      await fetchMessages(conversation.id);
      await checkMediaPermission(conversation.id);
      subscribeToMessages(conversation.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Fehler beim Laden des Chats');
    } finally {
      setLoading(false);
    }
  };

  const checkMediaPermission = async (convId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('can_send_media', {
        p_conversation_id: convId,
        p_recipient_id: recipientId,
      });

      if (error) {
        console.error('Error checking media permission:', error);
        return;
      }

      setCanSendMedia(data || false);
    } catch (error) {
      console.error('Error checking media permission:', error);
    }
  };

  const fetchMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages((data || []) as unknown as Message[]);
  };

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // Re-check media permission after new message
          checkMediaPermission(convId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId || !user) return;

    if (!canSendMedia) {
      toast.error('Der andere muss dir erst 3 Nachrichten senden, bevor du Dateien teilen kannst');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Nur Bilder (JPG, PNG, GIF, WEBP) und PDFs sind erlaubt');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei zu groß. Maximal 10MB erlaubt');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      const messageType = file.type.startsWith('image/') ? 'image' : 'pdf';
      const content = messageType === 'image' ? '📷 Bild' : '📄 PDF-Dokument';

      const { error: messageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        attachment_url: publicUrl,
      });

      if (messageError) throw messageError;

      toast.success('Datei gesendet!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Fehler beim Hochladen der Datei');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
      message_type: 'text',
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageContent,
        message_type: 'text',
      }).select().single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages((prev) => 
        prev.map((msg) => msg.id === tempId ? data as unknown as Message : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === user?.id;

    if (message.message_type === 'article' && message.article_data) {
      return (
        <div
          className={`max-w-[85%] rounded-2xl overflow-hidden shadow-md ${
            isOwn ? 'bg-primary text-white' : 'bg-white border border-gray-200'
          }`}
        >
          {message.article_data.image_url && (
            <img
              src={message.article_data.image_url}
              alt={message.article_data.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3">
            <h4 className={`font-bold text-sm mb-1 ${isOwn ? 'text-white' : 'text-black'}`}>
              {message.article_data.title}
            </h4>
            <p className={`text-xs mb-2 line-clamp-2 ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
              {message.article_data.excerpt}
            </p>
            <Button
              size="sm"
              variant={isOwn ? 'secondary' : 'default'}
              onClick={() => navigate(`/article/${message.article_data?.id}`)}
              className="w-full gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Artikel öffnen
            </Button>
          </div>
        </div>
      );
    }

    if (message.message_type === 'image' && message.attachment_url) {
      return (
        <div className="max-w-[75%]">
          <img
            src={message.attachment_url}
            alt="Geteiltes Bild"
            className="rounded-2xl max-h-80 object-cover shadow-md cursor-pointer"
            onClick={() => window.open(message.attachment_url!, '_blank')}
          />
        </div>
      );
    }

    if (message.message_type === 'pdf' && message.attachment_url) {
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
              onClick={() => window.open(message.attachment_url!, '_blank')}
              className="mt-2 gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Öffnen
            </Button>
          </div>
        </div>
      );
    }

    // Text message
    return (
      <div
        className={`max-w-[75%] rounded-[20px] px-4 py-2.5 shadow-sm ${
          isOwn
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white text-black rounded-bl-sm border border-gray-100'
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col pb-24 md:pb-0">
      {/* Header - Apple Style */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full p-2 -ml-2"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        
        <Avatar className="w-11 h-11 ring-2 ring-gray-100">
          <AvatarImage src={recipientAvatar || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
            {recipientName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="text-base font-bold text-black">{recipientName}</h2>
          <p className="text-xs text-gray-500">
            {canSendMedia ? 'Medien erlaubt' : 'Nur Text'}
          </p>
        </div>
      </div>

      {/* Messages Container - Apple iMessage Style */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Send className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              Noch keine Nachrichten
            </h3>
            <p className="text-gray-600">
              Sende die erste Nachricht an {recipientName}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const showTimestamp = index === 0 || 
              new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 min
            
            return (
              <div key={message.id} className="animate-fade-in">
                {showTimestamp && (
                  <div className="text-center mb-4">
                    <span className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                      {new Date(message.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {renderMessage(message)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Apple Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-4 shadow-lg mb-[68px] md:mb-0">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canSendMedia || uploading}
            className="rounded-full p-2 hover:bg-gray-100"
            title={canSendMedia ? 'Datei anhängen' : '3 Nachrichten vom Empfänger nötig'}
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht"
              className="rounded-full bg-gray-100 border-0 px-5 py-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary/20 resize-none h-11"
              disabled={!conversationId || uploading}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !conversationId || uploading}
            className="rounded-full w-11 h-11 p-0 bg-primary hover:bg-primary/90 shadow-md disabled:opacity-40 transition-all"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        {!canSendMedia && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Bilder & PDFs werden freigeschaltet, sobald {recipientName} dir 3 Nachrichten gesendet hat
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
