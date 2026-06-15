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
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (!error) setPosts(data);
    };

    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', session.sub)
        .eq('following_id', id)
        .single();

      if (data) setIsFollowing(true);
    };

    fetchProfile();
    fetchPosts();
    if (session) checkFollow();
  }, [id, session]);

  const handleFollow = async () => {
    await supabase.from('follows').insert({
      follower_id: session.sub,
      following_id: id,
    });
    setIsFollowing(true);
  };

  const handleUnfollow = async () => {
    await supabase.from('follows').delete()
      .eq('follower_id', session.sub)
      .eq('following_id', id);
    setIsFollowing(false);
  };

  if (loading) return <p>Laden...</p>;
  if (!profile) return <p>Profiel niet gevonden.</p>;
  if (profile.is_private) return <p>Dit profiel is privé.</p>;

  return (
    <div>
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="avatar" width={100} />
      )}
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>

      {session.sub !== id && (
        <button onClick={isFollowing ? handleUnfollow : handleFollow}>
          {isFollowing ? 'Ontvolgen' : 'Volgen'}
        </button>
      )}

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
    </div>
  );
}