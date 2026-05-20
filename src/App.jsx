import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
function App() {
  const [tabel, settabel] = useState([]);

  useEffect(() => {
    gettabel();
  }, []);

  async function gettabel() {
    const { data, error } = await supabase.from("tabel").select();

    if (error) {
      console.error(error);
      return;
    }

    settabel(data);
  }

  return (
    <ul>
      {tabel.map((tabel) => (
        <li key={tabel.naam}>{tabel.naam}</li>
      ))}
    </ul>
  );
}

export default App;