import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router';
const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  console.log('data:', data);
  console.log('error:', error);

  if (!error) setUsers(data);
};
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
    <div>
      <h1>Alle gebruikers</h1>
      {users.map((user) => (
        <div key={user.id} onClick={() => navigate(`/profile/${user.user_id}`)}>
          {user.avatar_url && (
            <img src={user.avatar_url} alt="avatar" width={40} />
          )}
          <p>{user.username}</p>
        </div>
      ))}
    </div>
  );
}