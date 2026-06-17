import './Discussions.css';
import {useState, useEffect} from 'react';
import {useSession} from '../hooks/useSession';
import SearchingPost, {Tags} from '../components/SearchingPost.jsx';
import {supabase} from '../supabase';
import {FaHeart} from 'react-icons/fa';
import {CiHeart} from 'react-icons/ci';

export default function Discussions() {
    const {session} = useSession();
    const [posts, setPosts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from('post')
            .select('*, profiles(username, avatar_url), likes(*)')
            .order('created_at', {ascending: false});

        if (!error) setPosts(data);
    };

    const toggleLike = async (post) => {
        if (!session) return;

        const liked = post.likes.some(like => like.user_id === session.sub);

        if (liked) {
            await supabase.from('likes').delete()
                .eq('post_id', post.id)
                .eq('user_id', session.sub);
        } else {
            await supabase.from('likes').insert({
                post_id: post.id,
                user_id: session.sub,
            });
        }

        fetchPosts();
    };

    const filteredPosts = posts.filter(post => {
        const matchesText = post.content?.toLowerCase().includes(searchText.toLowerCase());
        const matchesTags = selectedTags.length === 0 ||
            selectedTags.every(tag => post.tags?.includes(tag));
        return matchesText && matchesTags;
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="discussions-wrapper">
            <h1>Discussions</h1>

            <SearchingPost
                searchText={searchText}
                setSearchText={setSearchText}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
            />

            <div className="discussions-grid">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="discussion-card">
                        {post.profiles?.avatar_url && (
                            <img className="avatar" src={post.profiles.avatar_url} alt="avatar" />
                        )}
                        <p><strong>{post.profiles?.username}</strong></p>
                        <p>{post.content}</p>
                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags">
                                {post.tags.map(tag => (
                                    <span key={tag} className="tag-label">#{tag}</span>
                                ))}
                            </div>
                        )}
                        {post.image && (
                            <img className="post-image" src={post.image} alt="post afbeelding"/>
                        )}
                        <button className="like-btn" onClick={() => toggleLike(post)}>
                            {session && post.likes.some(like => like.user_id === session.sub)
                                ? <FaHeart/>
                                : <CiHeart/>
                            }
                            {post.likes.length}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
