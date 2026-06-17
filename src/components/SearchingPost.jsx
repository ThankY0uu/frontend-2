export const Tags = ["kpop", "cpop", "jpop", "kdrama", "cdrama", "jdrama"];

function SearchingPost({ searchText, setSearchText, selectedTags, setSelectedTags }) {
    function toggleTag(tag) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    return (
        <div className="search-box">
            <input
                className="search-input"
                placeholder="Zoek een post"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
            />
            <div className="tag-filters">
                {Tags.map(tag => (
                    <button
                        key={tag}
                        className={`tag-btn ${selectedTags.includes(tag) ? "active" : ""}`}
                        onClick={() => toggleTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SearchingPost;
