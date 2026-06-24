import './media.css';
import {useState, useEffect} from 'react';
import {supabase} from '../../supabase';

export default function Music() {
    const [news, setNews] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchNews = async () => {
        const {data, error} = await supabase
            .from('music_news')
            .select('*')
            .order('created_at', {ascending: false});

        if (!error) setNews(data);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const filtered = selectedCategory === 'all'
        ? news
        : news.filter(item => item.category === selectedCategory);

    return (
        <div className="news-wrapper">
            <h1>Music</h1>

            <div className="tag-filters">
                {['all', 'kpop', 'cpop', 'jpop'].map(cat => (
                    <button
                        key={cat}
                        className={`tag-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat === 'all' ? 'Alles' : cat}
                    </button>
                ))}
            </div>

            <div className="news-grid">
                {filtered.map(item => (
                    <div key={item.id} className="news-card">
                        <span className="news-category">{item.category}</span>
                        <h3>{item.title}</h3>
                        <p>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
