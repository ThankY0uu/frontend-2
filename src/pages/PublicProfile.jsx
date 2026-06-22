import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { supabase } from '../supabase';
const updateProfile = async () => {
  let avatarUrl = profile?.avatar_url ?? null;

  if (avatar) {
const fileName = `${session.sub}_${Date.now()}`;    console.log('uploading:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar);

    console.log('uploadError:', uploadError);

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      console.log('avatarUrl:', data.publicUrl);
      avatarUrl = data.publicUrl;
    }
  }

  console.log('saving avatarUrl:', avatarUrl);
}
export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (!error) setProfile(data);
    setLoading(false);
  };

  if (loading) return <p>Laden...</p>;
  if (!profile) return <p>Profiel niet gevonden.</p>;
  if (profile.is_private) return <p>Dit profiel is privé.</p>;

  return (
    <div>
      <h1>{profile.username}</h1>

      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="avatar" width={100} />
      )}

      <p>{profile.bio}</p>
    </div>
  );
}