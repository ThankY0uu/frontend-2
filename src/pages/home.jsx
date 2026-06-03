import { useState } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';

export default function Home() {
  const [content, setContent] = useState("");
  const { session } = useSession();

  async function submitHandler(event) {
    event.preventDefault();
    const { error } = await supabase.from("posts").insert({
      user_id: session.sub,
      content: content
    });
    if (!error) setContent("");
  }
  async function handleLogout() {
    await supabase.auth.signOut();
  }
  return (
    <div>
      <h1>Home
        <button onClick={handleLogout}>Uitloggen</button>


      </h1>
    </div>
  );
}