import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';
import './users.css';

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
      <div className="publicprofile-page">
        <div className="publicprofile-blocked-card">
          <p>Je hebt deze gebruiker geblokkeerd.</p>
          <button className="publicprofile-btn" onClick={unblockUser}>Deblokkeren</button>
        </div>
      </div>
    );
  }

  const isFriend = friendStatus === 'accepted';
  const canSeePosts = !profile.is_private || isFriend;

  return (
    <div className="publicprofile-page">
      <div
        className="publicprofile-card"
        style={{ background: profile.bg_color || '#fff' }}
      >
        <div className="publicprofile-header">
          {profile.avatar_url ? (
            <img className="publicprofile-avatar" src={profile.avatar_url} alt="avatar" />
          ) : (
            <div className="publicprofile-avatar-placeholder">?</div>
          )}

          <div className="publicprofile-info">
            <h1>{profile.username}</h1>
            <p className="publicprofile-bio">{profile.bio}</p>
          </div>
        </div>

        {session.sub !== id && (
          <div className="publicprofile-actions">
            {friendStatus === null && (
              <button className="publicprofile-btn" onClick={sendRequest}>Vriendschapsverzoek sturen</button>
            )}
            {friendStatus === 'pending' && (
              <button className="publicprofile-btn" disabled>Verzoek verstuurd</button>
            )}
            {friendStatus === 'accepted' && (
              <span className="publicprofile-friend-badge">✅ Vrienden</span>
            )}
            <button className="publicprofile-btn publicprofile-btn-danger" onClick={blockUser}>Blokkeren</button>
            <button className="publicprofile-btn" onClick={() => setShowReportForm(!showReportForm)}>Rapporteren</button>
          </div>
        )}

        {showReportForm && (
          <div className="publicprofile-report-box">
            <textarea
              placeholder="Waarom rapporteer je deze gebruiker?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <button className="publicprofile-btn" onClick={submitReport}>Melding versturen</button>
          </div>
        )}

        {reportMessage && <p className="publicprofile-report-message">{reportMessage}</p>}

        <div className="publicprofile-posts-section">
          <h2>Posts</h2>
          {canSeePosts ? (
            <>
              {posts.length === 0 && <p>Geen posts.</p>}
              <div className="publicprofile-posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="publicprofile-post-card">
                    {post.image && (
                      <img src={post.image} alt="post" />
                    )}
                    <p>{post.content}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>Dit profiel is privé. Stuur een vriendschapsverzoek om de posts te zien.</p>
          )}
        </div>
      </div>
    </div>
  );
}