import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MessageCircle, Settings, Loader2 } from 'lucide-react';
import InstallSidebar from '@/components/InstallSidebar';
import ChatInterface from '@/components/ChatInterface';
import { toast } from 'sonner';

interface ConversationWithProfile {
  id: string;
  other_user_id: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  display_name: string;
  avatar_url: string | null;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientAvatar: string | null;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchConversations();
    }
  }, [user, authLoading, navigate]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all conversations for the current user
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      if (!convData || convData.length === 0) {
        setConversations([]);
        return;
      }

      // Get the other user IDs
      const otherUserIds = convData.map((conv) =>
        conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id
      );

      // Fetch profiles for other users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      if (profilesError) throw profilesError;

      // Fetch last messages for each conversation
      const conversationsWithProfiles = await Promise.all(
        convData.map(async (conv) => {
          const otherUserId =
            conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id;
          const profile = profiles?.find((p) => p.user_id === otherUserId);

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            other_user_id: otherUserId,
            last_message: lastMsg?.content,
            last_message_time: lastMsg?.created_at,
            unread_count: count || 0,
            display_name: profile?.display_name || 'Unbekannt',
            avatar_url: profile?.avatar_url || null,
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Fehler beim Laden der Nachrichten');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedChat) {
    return (
      <ChatInterface
        recipientId={selectedChat.recipientId}
        recipientName={selectedChat.recipientName}
        recipientAvatar={selectedChat.recipientAvatar}
        onClose={() => {
          setSelectedChat(null);
          fetchConversations();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstallSidebar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Apple Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Nachrichten</h1>
            <button
              onClick={() => navigate('/weird')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-500">Ihre privaten Unterhaltungen</p>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
              <MessageCircle className="h-12 w-12 text-primary/40" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Noch keine Nachrichten
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              Besuchen Sie ein Profil und starten Sie eine Unterhaltung, indem Sie auf das
              Profilbild klicken
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md border-0 bg-white"
                onClick={() =>
                  setSelectedChat({
                    recipientId: conversation.other_user_id,
                    recipientName: conversation.display_name,
                    recipientAvatar: conversation.avatar_url,
                  })
                }
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-white">
                      <AvatarImage src={conversation.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                        {conversation.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.display_name}
                      </h3>
                      {conversation.last_message_time && (
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(conversation.last_message_time).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conversation.unread_count > 0
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {conversation.last_message || 'Noch keine Nachrichten'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
