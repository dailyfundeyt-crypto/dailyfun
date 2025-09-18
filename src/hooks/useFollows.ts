import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFollows = () => {
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFollowedAuthors();
    } else {
      setFollowedAuthors([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFollowedAuthors = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follows')
        .select('following_author')
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error fetching followed authors:', error);
        return;
      }

      setFollowedAuthors(data?.map(follow => follow.following_author) || []);
    } catch (error) {
      console.error('Error fetching followed authors:', error);
    } finally {
      setLoading(false);
    }
  };

  return { followedAuthors, loading, refetchFollows: fetchFollowedAuthors };
};