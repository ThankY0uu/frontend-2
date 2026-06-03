import { useSession } from '../hooks/useSession';
import { supabase } from '../supabase';
import './Header.css';
import logo from '/Logo.png';


export default function Header() {
    const { session } = useSession();

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <div className="header-wrapper">
            <header className="header">
                <nav className="header-nav">
                    <a href="#">Drama</a>
                    <a href="#">Music</a>
                    <a href="#">News</a>
                    <a href="#">Discussions</a>
                </nav>

                <div className="header-logo">
                    <img src={logo} alt="TeaNet logo" />
                </div>

                <nav className="header-right">
                    <a href="#">Friends</a>
                    <a href="#">Chat</a>
                    <a href="#">Discover</a>
                    <a href="#">Profile</a>
                    {session && (
                        <div className="header-user">
                            <span>{session.email}</span>
                            <div className="header-avatar">
                                {session.email?.[0].toUpperCase()}
                            </div>
                            <button onClick={handleLogout}>Uitloggen</button>
                        </div>
                    )}
                </nav>
            </header>
        </div>
    );
}