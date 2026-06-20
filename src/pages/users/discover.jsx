import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router';
import './users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
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

  return (
    <div className="discover-page">
      <h1>Alle gebruikers</h1>
      <div className="discover-grid">
        {users.map((user) => (
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