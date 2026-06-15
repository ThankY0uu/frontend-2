import { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { supabase } from '../supabase';
import './Header.css';
import logo from '/Logo.png';

export default function Header() {
    const { session } = useSession();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (session) fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('user_id', session.sub)
            .single();

        if (data) setProfile(data);
    };

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <div className="header-wrapper">
            <header className="header">
                <nav className="header-nav">
                    <a href="/explorer-pages/drama">Drama</a>
                    <a href="/explorer-pages/music">Music</a>
                    <a href="/explorer-pages/news">News</a>
                    <a href="discussions">Discussions</a>
                </nav>

                <div className="header-logo">
                    <img src={logo} alt="TeaNet logo" />
                </div>

                <nav className="header-right">
                    <a href="/users/friends">Friends</a>
                    <a href="#">Chat</a>
                    <a href="/users/discover">Discover</a>
                    <a href="/profile">Profile</a>
                    {session && (
                        <div className="header-user">
                            <span>{profile?.username ?? session.email}</span>
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="avatar"
                                    className="header-avatar"
                                />
                            ) : (
                                <div className="header-avatar">
                                    {session.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <button onClick={handleLogout}>Uitloggen</button>
                        </div>
                    )}
                </nav>
            </header>
        </div>
    );
}