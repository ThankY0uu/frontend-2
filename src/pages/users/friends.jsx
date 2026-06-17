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
        .from('friend_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${session.sub},receiver_id.eq.${session.sub}`);

      if (error || !data) return;

      const friendIds = data.map((req) =>
        req.sender_id === session.sub ? req.receiver_id : req.sender_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', friendIds);

      if (profiles) setFriends(profiles);
    };

    fetchFriends();
  }, [session]);

  return (
    <div>
      <h1>Mijn vrienden</h1>
      {friends.length === 0 && <p>Je hebt nog geen vrienden.</p>}
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