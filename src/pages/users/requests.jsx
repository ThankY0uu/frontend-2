import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';
import './users.css';

export default function Requests() {
  const { session } = useSession();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!session) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', session.sub)
        .eq('status', 'pending');

      if (error || !data) return;

      const senderIds = data.map((r) => r.sender_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', senderIds);

      const combined = data.map((req) => ({
        ...req,
        profile: profiles?.find((p) => p.user_id === req.sender_id),
      }));

      setRequests(combined);
    };

    fetchRequests();
  }, [session]);

  const acceptRequest = async (requestId) => {
    await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const declineRequest = async (requestId) => {
    await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);

    setRequests(requests.filter((r) => r.id !== requestId));
  };

  return (
    <div className="requests-page">
      <h1>Vriendschapsverzoeken</h1>
      {requests.length === 0 && <p>Geen openstaande verzoeken.</p>}
      <div className="requests-list">
        {requests.map((req) => (
          <div key={req.id} className="requests-card">
            <p>{req.profile?.username}</p>
            <div className="requests-actions">
              <button className="requests-btn-accept" onClick={() => acceptRequest(req.id)}>Accepteren</button>
              <button className="requests-btn-decline" onClick={() => declineRequest(req.id)}>Weigeren</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}