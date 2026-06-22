import {useState, useEffect} from 'react';
import {useSession} from '../hooks/useSession';
import {supabase} from '../supabase';


export default function Home() {
    const {session} = useSession();
    const [content, setContent] = useState('');
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from("posts")
            .select("*")
            .order("created_at", {ascending: false});

        if (!error) setPosts(data);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const {error} = await supabase.from("posts").insert({
            user_id: session.sub,
            content: content,
        });

        if (!error) {
            setContent("");
            await fetchPosts();
        }
    };

    const handleDelete = async (id) => {
        const {error} = await supabase.from("posts").delete().eq("id", id);
        if (!error) await fetchPosts();
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <p>Ingelogd als: {session?.email}</p>
            <button onClick={() => supabase.auth.signOut()}>Logout</button>

            <form onSubmit={handleSubmit}>
                <textarea
                    rows="4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Schrijf een post"
                />
                <button type="submit">Posten</button>
            </form>

            {posts.map((post) => (
                <div key={post.id}>
                    <p>{post.content}</p>
                    {post.user_id === session?.sub && (
                        <button onClick={() => handleDelete(post.id)}>
                            Verwijderen
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
