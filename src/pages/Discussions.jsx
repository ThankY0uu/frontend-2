import './Discussions.css';
import {useState, useEffect} from 'react';
import {useSession} from '../hooks/useSession';
import SearchingPost from '../components/SearchingPost.jsx';
import {supabase} from '../supabase';
import {FaPenAlt} from "react-icons/fa";
import {Link} from "react-router";
import {FaHeart} from 'react-icons/fa';
import {CiHeart} from 'react-icons/ci';

export default function Discussions() {
    const {session} = useSession();
    const [posts, setPosts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [comments, setComments] = useState({});
    const [commentInput, setCommentInput] = useState({});

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from('post')
            .select('*, profiles(username, avatar_url, is_private), likes(*)')
            .order('created_at', {ascending: false});

        if (!error) setPosts(data);
    };

    const fetchComments = async (postId) => {
        const {data, error} = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', {ascending: true});

        if (!error) setComments(prev => ({...prev, [postId]: data}));
    };

    const isFriend = async (postOwnerId) => {
        const {data} = await supabase
            .from('friend_requests')
            .select('id')
            .eq('status', 'accepted')
            .or(`and(sender_id.eq.${session.sub},receiver_id.eq.${postOwnerId}),and(sender_id.eq.${postOwnerId},receiver_id.eq.${session.sub})`);

        return data && data.length > 0;
    };

    const handleComment = async (post) => {
        const content = commentInput[post.id]?.trim();
        if (!content || !session) return;

        if (post.profiles?.is_private) {
            const friend = await isFriend(post.user_id);
            if (!friend) return;
        }

        const {error} = await supabase.from('comments').insert({
            post_id: post.id,
            user_id: session.sub,
            content: content,
        });

        console.log('error:', error);
        console.log('post_id:', post.id);
        console.log('user_id:', session.sub);
        console.log('content:', content);

        if (!error) {
            setCommentInput(prev => ({...prev, [post.id]: ''}));
            await fetchComments(post.id);
        }
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

    useEffect(() => {
        posts.forEach(post => fetchComments(post.id));
    }, [posts]);

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
                            <img className="avatar" src={post.profiles.avatar_url} alt="avatar"/>
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

                        <div className="comments-section">
                            {comments[post.id]?.map(comment => (
                                <div key={comment.id} className="comment">
                                    <strong>{comment.profiles?.username}</strong>
                                    <p>{comment.content}</p>
                                </div>
                            ))}

                            {session && (
                                post.profiles?.is_private
                                    ? <PrivateCommentInput post={post} commentInput={commentInput}
                                                           setCommentInput={setCommentInput}
                                                           handleComment={handleComment} isFriend={isFriend}
                                                           session={session}/>
                                    : (
                                        <div className="comment-input-row">
                                            <input
                                                className="comment-input"
                                                placeholder="Schrijf een comment..."
                                                value={commentInput[post.id] || ''}
                                                onChange={(e) => setCommentInput(prev => ({
                                                    ...prev,
                                                    [post.id]: e.target.value
                                                }))}
                                            />
                                            <button className="comment-submit-btn" onClick={() => handleComment(post)}>
                                                Stuur
                                            </button>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Link to="/">
                <button className="post-btn">
                    <FaPenAlt/>
                </button>
            </Link>
        </div>
    );
}

function PrivateCommentInput({post, commentInput, setCommentInput, handleComment, isFriend, session}) {
    const [allowed, setAllowed] = useState(null);

    useEffect(() => {
        isFriend(post.user_id).then(setAllowed);
    }, [post.user_id, session]);

    if (allowed === null) return null;
    if (!allowed) return <p className="private-notice">Alleen vrienden kunnen commenten.</p>;

    return (
        <div className="comment-input-row">
            <input
                className="comment-input"
                placeholder="Schrijf een comment..."
                value={commentInput[post.id] || ''}
                onChange={(e) => setCommentInput(prev => ({...prev, [post.id]: e.target.value}))}
            />
            <button className="comment-submit-btn" onClick={() => handleComment(post)}>
                Stuur
            </button>
        </div>
    );
}
