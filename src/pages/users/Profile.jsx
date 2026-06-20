import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useSession } from '../../hooks/useSession';
import './users.css';

export default function Profile() {
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.sub)
        .single();

      if (!error && data) {
        setProfile(data);
        setUsername(data.username ?? '');
        setBio(data.bio ?? '');
        setIsPrivate(data.is_private ?? false);
        setBgColor(data.bg_color ?? '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const updateProfile = async () => {
    let avatarUrl = profile?.avatar_url ?? null;

    if (avatar) {
      const fileName = `${session.sub}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('Profiel fotos')
        .upload(fileName, avatar);

      if (!uploadError) {
        const { data } = supabase.storage.from('Profiel fotos').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        is_private: isPrivate,
        avatar_url: avatarUrl,
        bg_color: bgColor,
      })
      .eq('user_id', session.sub);

    if (!error) setMessage('Profiel opgeslagen!');
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  if (loading) return <p>Laden...</p>;
return (
    <div className="profile-page">
      <div className="profile-card" style={{ background: bgColor || '#fff' }}>
        <a href="requests" className="profile-requests-link">Verzoeken</a>
        <h1>Mijn profiel</h1>

        <div className="profile-grid">
          {/* Links */}
          <div className="profile-col-left">
            <div className="profile-avatar-box">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" />
              ) : (
                <div className="profile-avatar-placeholder">?</div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>

            <div className="profile-tags-box">
              Favorite tags (binnenkort)
            </div>

            <div className="profile-color-box">
              <label>Achtergrondkleur publiek profiel</label>
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#fdf8ff"
              />
            </div>
          </div>

          {/* Rechts */}
          <div className="profile-col-right">
            <div className="profile-username-box">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Gebruikersnaam"
              />
            </div>

            <div className="profile-bio-box">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              />
            </div>

            <div className="profile-joined-box">
              Lid sinds {joinedDate}
            </div>
          </div>
        </div>

        <div className="profile-footer">
          <label className="profile-private-toggle">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Profiel privé maken
          </label>

          <button className="profile-save-btn" onClick={updateProfile}>Opslaan</button>
        </div>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}