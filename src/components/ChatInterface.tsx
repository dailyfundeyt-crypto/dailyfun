import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      subscribeToMessages(conversation.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Fehler beim Laden des Chats');
    } finally {
      setLoading(false);
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

    setMessages(data || []);
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col">
      {/* Header - Apple Style */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={recipientAvatar || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
            {recipientName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">{recipientName}</h2>
          <p className="text-xs text-gray-500">Aktiv</p>
        </div>
      </div>

      {/* Messages Container - Apple iMessage Style */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
              <Send className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Noch keine Nachrichten
            </h3>
            <p className="text-sm text-gray-500">
              Sende die erste Nachricht an {recipientName}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[70%] rounded-3xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  } shadow-sm`}
                >
                  <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                  <p
                    className={`text-[11px] mt-1 ${
                      isOwn ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Apple Style */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht..."
              className="rounded-full bg-gray-100 border-0 px-4 py-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
              disabled={!conversationId}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !conversationId}
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
