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
    const [filterTags, setFilterTags] = useState([]);

    const fetchPosts = async () => {
        const {data, error} = await supabase
            .from("post")
            .select("*, profiles(username, avatar_url), likes(*)")
            .order("created_at", {ascending: false});

        if (!error) setPosts(data);
    };

    const filteredPosts = filterTags.length === 0
        ? posts
        : posts.filter(post => post.tags?.some(tag => filterTags.includes(tag)));

    const toggleFilterTag = (tag) => {
        if (filterTags.includes(tag)) {
            setFilterTags(filterTags.filter(t => t !== tag));
        } else {
            setFilterTags([...filterTags, tag]);
        }
    };

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

            <div className="tag-filters">
                {Tags.map(tag => (
                    <button
                        key={tag}
                        className={`tag-btn ${filterTags.includes(tag) ? "active" : ""}`}
                        onClick={() => toggleFilterTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    rows="5"
                    placeholder="Schrijf een post..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
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

            {filteredPosts
                .filter(post => post.user_id === session?.sub)
                .map((post) => (
                    <div key={post.id}>
                        {post.profiles?.avatar_url && (
                            <img src={post.profiles.avatar_url} alt="avatar" width={40}/>
                        )}
                        <p><strong>{post.profiles?.username}</strong></p>
                        <p>{post.content}</p>
                        {post.tags?.length > 0 && (
                            <div className="tag-filters">
                                {post.tags.map(tag => (
                                    <span key={tag} className="tag-btn">{tag}</span>
                                ))}
                            </div>
                        )}
                        {post.image && (
                            <img src={post.image} alt="post afbeelding" width={200}/>
                        )}
                        <button onClick={() => handleDelete(post.id)}>
                            Verwijderen
                        </button>
                    </div>
                ))}
        </div>
    );
}
