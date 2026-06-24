import './home.css';
import {useState, useEffect} from 'react';
import {useSession} from '../hooks/useSession';
import {supabase} from '../supabase';
import {Tags} from '../components/SearchingPost';

export default function Home() {
    const {session} = useSession();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from("post")
            .select("*, profiles(username, avatar_url), likes(*)")
            .order("created_at", {ascending: false});

        if (!error) setPosts(data);
    };

    // Tags toevoegen aan nieuwe post
    const togglePostTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
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
            tags: selectedTags,
        });

        if (!error) {
            setContent("");
            setImage(null);
            setSelectedTags([]);
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

                {/* Tags toevoegen aan je nieuwe post */}
                <div className="tag-filters">
                    {Tags.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            className={`tag-btn ${selectedTags.includes(tag) ? "active" : ""}`}
                            onClick={() => togglePostTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

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

            {/* Alleen posts van de ingelogde gebruiker tonen */}
            {posts
                .filter(post => post.user_id === session?.sub)
                .map((post) => (
                    <div key={post.id}>

                        {/* Toon avatar alleen als die bestaat */}
                        {post.profiles?.avatar_url && (
                            <img src={post.profiles.avatar_url} alt="avatar" width={40}/>
                        )}

                        <p><strong>{post.profiles?.username}</strong></p>
                        <p>{post.content}</p>

                        {/* Toon tags alleen als de post er minstens een heeft */}
                        {post.tags?.length > 0 && (
                            <div className="tag-filters">
                                {post.tags.map(tag => (
                                    <span key={tag} className="tag-btn">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Toon afbeelding alleen als die bestaat */}
                        {post.image && (
                            <img src={post.image} alt="post afbeelding" width={200}/>
                        )}

                        {/* Geef het ID van deze post mee zodat handleDelete de juiste verwijdert */}
                        <button onClick={() => handleDelete(post.id)}>
                            Verwijderen
                        </button>
                    </div>
                ))}
        </div>
    );
}
 