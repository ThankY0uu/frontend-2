import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';
import { useNavigate } from 'react-router';
import './users.css';

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

      // Haal geblokkeerde users op
      const { data: blocked } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', session.sub);

      const blockedIds = blocked?.map((b) => b.blocked_id) || [];

      // Filter geblokkeerde users uit vriendenlijst
      const filteredProfiles = profiles?.filter(
        (p) => !blockedIds.includes(p.user_id)
      );

      if (filteredProfiles) setFriends(filteredProfiles);
    };                                           

    fetchFriends();
  }, [session]);

  return (
    <div className="friends-page">
      <h1>Mijn vrienden</h1>
      {friends.length === 0 && <p>Je hebt nog geen vrienden.</p>}
      <div className="friends-grid">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="friends-card"
            onClick={() => navigate(`/profile/${friend.user_id}`)}
          >
            {friend.avatar_url ? (
              <img src={friend.avatar_url} alt="avatar" />
            ) : (
              <div className="friends-avatar-placeholder">?</div>
            )}
            <p>{friend.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}