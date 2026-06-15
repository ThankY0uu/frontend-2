import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';
import { useNavigate } from 'react-router';

export default function Friends() {
  const { session } = useSession();
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;

    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', session.sub);

      if (error || !data) return;

      const ids = data.map((f) => f.following_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', ids);

      if (profiles) setFriends(profiles);
    };

    fetchFriends();
  }, [session]);

  return (
    <div>
      <h1>Mensen die ik volg</h1>
      {friends.length === 0 && <p>Je volgt nog niemand.</p>}
      {friends.map((friend) => (
        <div key={friend.id} onClick={() => navigate(`/profile/${friend.user_id}`)}>
          {friend.avatar_url && (
            <img src={friend.avatar_url} alt="avatar" width={40} />
          )}
          <p>{friend.username}</p>
        </div>
      ))}
    </div>
  );
}