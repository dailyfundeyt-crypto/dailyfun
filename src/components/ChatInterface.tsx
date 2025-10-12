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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
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
          <p className="text-xs text-gray-500">Aktiv</p>
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
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Apple Style */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht"
              className="rounded-full bg-gray-100 border-0 px-5 py-3 text-[15px] focus-visible:ring-2 focus-visible:ring-primary/20 resize-none h-11"
              disabled={!conversationId}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !conversationId}
            className="rounded-full w-11 h-11 p-0 bg-primary hover:bg-primary/90 shadow-md disabled:opacity-40 transition-all"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
