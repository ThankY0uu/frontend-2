import './home.css';
import {useState, useEffect} from 'react';
import {useSession} from '../hooks/useSession';
import {supabase} from '../supabase';

export default function Home() {
    const {session} = useSession();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from("post")
            .select("*")
            .order("created_at", {ascending: false});

        if (!error) setPosts(data);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        let imageUrl = null;

        if (image) {
            const fileName = `${Date.now()}_${image.name}`;

            const {error: uploadError} = await supabase.storage
                .from("Post")
                .upload(fileName, image);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return;
            }

            const {data: urlData} = supabase.storage
                .from("Post")
                .getPublicUrl(fileName);

            imageUrl = urlData.publicUrl;
        }

        const {error} = await supabase.from("post").insert({
            user_id: session.sub,
            content: content,
            image: imageUrl,
        });

        if (!error) {
            setContent("");
            setImage(null);
            fetchPosts();
        }
    };

    const handleDelete = async (id) => {
        const {error} = await supabase.from("post").delete().eq("id", id);
        if (!error) fetchPosts();
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <h1>Posten</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    rows="5"
                    placeholder="Schrijf een post..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <label className="file-label">
                    {image ? image.name : "Kies foto"}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </label>
                <button type="submit">Posten</button>
            </form>

            {posts.map((post) => (
                <div key={post.id}>
                    <p>{post.content}</p>
                    {post.image && (
                        <img src={post.image} alt="post afbeelding" width={200}/>
                    )}
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
