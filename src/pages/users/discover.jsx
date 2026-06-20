import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router';
import './users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (!error) setUsers(data);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="discover-page">
      <h1>Alle gebruikers</h1>

      <input
        className="discover-search"
        type="text"
        placeholder="Zoek op gebruikersnaam..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredUsers.length === 0 && <p>Geen gebruikers gevonden.</p>}

      <div className="discover-grid">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="discover-card"
            onClick={() => navigate(`/profile/${user.user_id}`)}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" />
            ) : (
              <div className="discover-avatar-placeholder">?</div>
            )}
            <p>{user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}