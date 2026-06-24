import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';

export default function Profile() {
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

useEffect(() => {
  if (session) fetchProfile();
}, [session]);

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
    }
    setLoading(false);
  };

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
      .update({ username, bio, is_private: isPrivate, avatar_url: avatarUrl })
      .eq('user_id', session.sub);

    if (!error) setMessage('Profiel opgeslagen!');
  };

  if (loading) return <p>Laden...</p>;

  return (
    <div>
      <h1>Mijn profiel</h1>

      {profile?.avatar_url && (
        <img src={profile.avatar_url} alt="avatar" width={100} />
      )}

      <div>
        <label>Gebruikersnaam</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Profiel privé maken
        </label>
      </div>

      <div>
        <label>Profielfoto</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
        />
      </div>

      {message && <p>{message}</p>}

      <button onClick={updateProfile}>Opslaan</button>
    </div>
  );
}