import { useEffect, useState } from "react";  
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  // We veranderen de naam naar 'topics' zodat het duidelijk is wat erin zit
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    getTopics();
  }, []);

  async function getTopics() {
    // AANPASSING: "tabel" veranderd naar "Topics" (zoals in je Supabase screenshot)
    const { data, error } = await supabase.from("Topics").select();

    if (error) {
      console.error("Fout bij ophalen:", error);
      return;
    }

    setTopics(data);
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>TeaNet Topics ☕</h1>
      
      {/* Als er nog geen data is, laat een laadbericht zien */}
      {topics.length === 0 ? (
        <p>Laden...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* We lopen door alle rijen van je database heen */}
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              style={{ 
                border: "1px solid #ccc", 
                borderRadius: "8px", 
                padding: "15px",
                backgroundColor: "#f9f9f9" 
              }}
            >
              {/* 'titel' en 'beschrijving' komen exact overeen met je database kolommen */}
              <h2 style={{ margin: "0 0 10px 0" }}>{topic.titel}</h2>
              <p style={{ margin: 0, color: "#555" }}>{topic.beschrijving}</p>
              <small style={{ color: "#999" }}>
                Gepost op: {new Date(topic.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;