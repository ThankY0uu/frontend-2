import { useSession } from '../hooks/useSession';
import { supabase } from '../supabase';
import { Link } from 'react-router';
import { FaPenAlt } from 'react-icons/fa';
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
                    <Link to="/">Discussions</Link>
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

            {session && (
                <Link to="/home">
                    <button className="post-btn"><FaPenAlt /></button>
                </Link>
            )}
        </div>
    );
}
