

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import './Auth.css';


export default function Home(){
const [content, setContent] = useState("");
const {session} = useSession();
function submitHandler(event){
    event.preventDefault();

    const {error } = await supabase.from("posts").insert({
        user_id: session.sub,
        content: content
    });
    if (!error) setContent("");
}
return


}
