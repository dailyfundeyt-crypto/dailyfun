import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp, MoreVertical, ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  article_id: string;
  user_profile: {
    display_name: string;
    avatar_url: string;
  };
}

interface ConversationWithProfile {
  id: string;
  other_user_id: string;
  display_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ recipientId: string; recipientName: string; recipientAvatar: string | null } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch comments on user's articles
      const { data: userArticles } = await supabase
        .from('user_articles')
        .select('id')
        .eq('user_id', user.id);

      if (userArticles && userArticles.length > 0) {
        const articleIds = userArticles.map(a => a.id);
        
        const { data: commentsData } = await supabase
          .from('article_comments')
          .select('id, content, created_at, article_id, user_id')
          .in('article_id', articleIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (commentsData) {
          const commentsWithProfiles = await Promise.all(
            commentsData.map(async (c) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('user_id', c.user_id)
                .single();

              return {
                id: c.id,
                content: c.content,
                created_at: c.created_at,
                article_id: c.article_id,
                user_profile: {
                  display_name: profile?.display_name || 'Unbekannt',
                  avatar_url: profile?.avatar_url || ''
                }
              };
            })
          );
          setComments(commentsWithProfiles);
        }
      }

      // Fetch conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsData) {
        const conversationsWithProfiles = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', otherUserId)
              .single();

            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              id: conv.id,
              other_user_id: otherUserId,
              display_name: profile?.display_name || 'Unbekannt',
              avatar_url: profile?.avatar_url || null,
              last_message: lastMessage?.content || 'Keine Nachrichten',
              last_message_time: lastMessage?.created_at || conv.created_at,
              unread_count: 0
            };
          })
        );

        setConversations(conversationsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Nachrichten
            </Button>
          </div>
          <ChatInterface
            recipientId={selectedChat.recipientId}
            recipientName={selectedChat.recipientName}
            recipientAvatar={selectedChat.recipientAvatar}
            onClose={() => setSelectedChat(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nachrichten</h1>
          <p className="text-muted-foreground">Private Chats und Kommentare verwalten</p>
        </div>

        <Tabs defaultValue="private" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="private" className="data-[state=active]:bg-background">
              <MessageCircle className="h-4 w-4 mr-2" />
              Private Nachrichten
            </TabsTrigger>
            <TabsTrigger value="public" className="data-[state=active]:bg-background">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Kommentare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="space-y-4">
            {conversations.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Keine Nachrichten</h3>
                  <p className="text-sm text-muted-foreground">
                    Du hast noch keine privaten Nachrichten erhalten.
                  </p>
                </div>
              </Card>
            ) : (
              conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-5 bg-card hover:bg-accent/10 transition-all cursor-pointer border-border group"
                  onClick={() => setSelectedChat({
                    recipientId: conv.other_user_id,
                    recipientName: conv.display_name,
                    recipientAvatar: conv.avatar_url
                  })}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={conv.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {conv.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-base truncate">{conv.display_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_time), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4">
            {comments.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Keine Kommentare</h3>
                  <p className="text-sm text-muted-foreground">
                    Du hast noch keine Kommentare auf deine Artikel erhalten.
                  </p>
                </div>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-6 bg-card hover:bg-accent/5 transition-all border-border">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user_profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {comment.user_profile.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{comment.user_profile.display_name}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </span>
                      </div>
                      <p className="text-foreground mb-3 text-sm">{comment.content}</p>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          Antworten
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Messages;
