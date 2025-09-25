import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_AUTHORS = [
  'Stefan Kunc',
  'Dr. Elke Schneider', 
  'Karl Bergmann',
  'Jonas Richter'
];

export const useAutoFollow = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const autoFollowDefaultAuthors = async () => {
      try {
        // Check if user has auto-followed flag in their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching user profile:', profileError);
          return;
        }

        // Check which default authors are not being followed yet
        const { data: existingFollows, error: fetchError } = await supabase
          .from('follows')
          .select('following_author')
          .eq('follower_id', user.id)
          .in('following_author', DEFAULT_AUTHORS);

        if (fetchError) {
          console.error('Error fetching existing follows:', fetchError);
          return;
        }

        const followedAuthors = existingFollows?.map(f => f.following_author) || [];
        const authorsToFollow = DEFAULT_AUTHORS.filter(author => 
          !followedAuthors.includes(author)
        );

        // Auto-follow authors that aren't being followed yet (only on first signup)
        if (authorsToFollow.length === DEFAULT_AUTHORS.length) {
          const followData = authorsToFollow.map(author => ({
            follower_id: user.id,
            following_author: author
          }));

          const { error: insertError } = await supabase
            .from('follows')
            .insert(followData);

          if (insertError) {
            console.error('Error auto-following default authors:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in auto-follow:', error);
      }
    };

    autoFollowDefaultAuthors();
  }, [user]);

  return { DEFAULT_AUTHORS };
};