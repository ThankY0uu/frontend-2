import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';

export default function PublicProfile() {
  const { id } = useParams();
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState(null);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    const fetchPosts = async () => {
      const { data } = await supabase
        .from('post')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
    };

    const checkFriendStatus = async () => {
      const { data } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${session.sub},receiver_id.eq.${session.sub}`)
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
        .single();

      if (data) setFriendStatus(data.status);
    };

    const checkBlocked = async () => {
      const { data } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', session.sub)
        .eq('blocked_id', id)
        .single();

      if (data) setIsBlocked(true);
    };

    fetchProfile();
    fetchPosts();
    checkFriendStatus();
    checkBlocked();
  }, [id, session]);

  const sendRequest = async () => {
    await supabase.from('friend_requests').insert({
      sender_id: session.sub,
      receiver_id: id,
    });
    setFriendStatus('pending');
  };

  const blockUser = async () => {
    await supabase.from('blocks').insert({
      blocker_id: session.sub,
      blocked_id: id,
    });
    setIsBlocked(true);
  };

  const unblockUser = async () => {
    await supabase.from('blocks').delete()
      .eq('blocker_id', session.sub)
      .eq('blocked_id', id);
    setIsBlocked(false);
  };

  const submitReport = async () => {
    await supabase.from('reports').insert({
      reporter_id: session.sub,
      reported_user_id: id,
      reason: reportReason,
    });
    setReportMessage('Melding verstuurd. Bedankt!');
    setReportReason('');
    setShowReportForm(false);
  };

  if (loading) return <p>Laden...</p>;
  if (!profile) return <p>Profiel niet gevonden.</p>;

  if (isBlocked) {
    return (
      <div>
        <p>Je hebt deze gebruiker geblokkeerd.</p>
        <button onClick={unblockUser}>Deblokkeren</button>
      </div>
    );
  }

  const isFriend = friendStatus === 'accepted';
  const canSeePosts = !profile.is_private || isFriend;

  return (
    <div>
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="avatar" width={100} />
      )}
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>

      {session.sub !== id && (
        <>
          {friendStatus === null && (
            <button onClick={sendRequest}>Vriendschapsverzoek sturen</button>
          )}
          {friendStatus === 'pending' && (
            <button disabled>Verzoek verstuurd</button>
          )}
          {friendStatus === 'accepted' && (
            <p>✅ Vrienden</p>
          )}
          <button onClick={blockUser}>Blokkeren</button>
          <button onClick={() => setShowReportForm(!showReportForm)}>Rapporteren</button>
        </>
      )}

      {showReportForm && (
        <div>
          <textarea
            placeholder="Waarom rapporteer je deze gebruiker?"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <button onClick={submitReport}>Melding versturen</button>
        </div>
      )}

      {reportMessage && <p>{reportMessage}</p>}

      {canSeePosts ? (
        <>
          <h2>Posts</h2>
          {posts.length === 0 && <p>Geen posts.</p>}
          {posts.map((post) => (
            <div key={post.id}>
              <p>{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="post" width={200} />
              )}
            </div>
          ))}
        </>
      ) : (
        <p>Dit profiel is privé. Stuur een vriendschapsverzoek om de posts te zien.</p>
      )}
    </div>
  );
}