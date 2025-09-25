import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_AUTHORS = [
  'Stefan Kunc',
  'Dr. Elke Schneider',
  'Karl Bergmann', 
  'Jonas Richter'
];

interface AuthorFollowButtonProps {
  authorName: string;
  className?: string;
  onFollowChange?: () => void;
}

const AuthorFollowButton: React.FC<AuthorFollowButtonProps> = ({ 
  authorName, 
  className = '',
  onFollowChange
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkFollowStatus();
    }
  }, [user, authorName]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_author', authorName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Bitte melden Sie sich an, um Autoren zu folgen.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_author', authorName);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: 'Entfolgt',
          description: `Sie folgen ${authorName} nicht mehr.`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_author: authorName,
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: 'Gefolgt',
          description: `Sie folgen jetzt ${authorName}.`,
        });
      }
      
      // Trigger callback to refresh follows
      onFollowChange?.();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Fehler',
        description: 'Es gab ein Problem beim Folgen/Entfolgen.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
      className={`ml-2 ${className}`}
    >
      {isFollowing ? (
        <>
          <Heart className="w-4 h-4 mr-1 fill-current" />
          Gefolgt
        </>
      ) : (
        <>
          <HeartIcon className="w-4 h-4 mr-1" />
          Folgen
        </>
      )}
    </Button>
  );
};

export default AuthorFollowButton;