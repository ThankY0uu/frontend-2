import './home.css';
import { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { supabase } from '../supabase';
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";

export default function Home() {
    const { session } = useSession();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from("post")
            .select("*, profiles(username, avatar_url), likes(*)")
            .order("created_at", { ascending: false });

        if (!error) setPosts(data);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Veiligheidscheck: stop als de gebruiker niet is ingelogd
        if (!session?.sub) {
            alert("Je moet ingelogd zijn om te posten!");
            return;
        }

        let imageUrl = null;

        if (image) {
            const fileName = `${Date.now()}_${image.name}`;

            const { error: uploadError } = await supabase.storage
                .from("Post")
                .upload(fileName, image);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return;
            }

            const { data: urlData } = supabase.storage
                .from("Post")
                .getPublicUrl(fileName);

            imageUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from("post").insert({
            user_id: session.sub, // Nu veilig wegens de check hierboven
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
        const { error } = await supabase.from("post").delete().eq("id", id);
        if (!error) fetchPosts();
    };

    const toggleLike = async (post) => {
        // Veiligheidscheck: voorkom liken als je niet bent ingelogd
        if (!session?.sub) {
            alert("Log eerst in om te liken!");
            return;
        }

        const liked = post.likes?.some(like => like.user_id === session.sub);

        if (liked) {
            await supabase.from("likes").delete()
                .eq("post_id", post.id)
                .eq("user_id", session.sub);
        } else {
            await supabase.from("likes").insert({
                post_id: post.id,
                user_id: session.sub,
            });
        }

        fetchPosts();
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
                    // required verwijderd voor het geval iemand alleen een foto post
                />
                <label className="file-label">
                    {image ? image.name : "Kies foto"}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </label>
                <button type="submit" disabled={!content && !image}>Posten</button>
            </form>

            {posts.map((post) => (
                <div key={post.id}>
                    {post.profiles?.avatar_url && (
                        <img src={post.profiles.avatar_url} alt="avatar" width={40}/>
                    )}
                    <p><strong>{post.profiles?.username || "Anoniem"}</strong></p>
                    <p>{post.content}</p>
                    {post.image && (
                        <img src={post.image} alt="post afbeelding" width={200}/>
                    )}
                    <button onClick={() => toggleLike(post)}>
                        {post.likes?.some(like => like.user_id === session?.sub)
                            ? <FaHeart/>
                            : <CiHeart/>
                        }
                        {post.likes?.length || 0}
                    </button>
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