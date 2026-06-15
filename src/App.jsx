import { Routes, Route } from 'react-router';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Header from './components/Header';
import Profile from './pages/Profile';
import PublicProfile from './pages/users/PublicProfile';
import Users from './pages/users/discover';
import Friends from './pages/users/friends';


export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/users/discover" element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        } />
        <Route path="/users/friends" element={
          <PrivateRoute>
            <Friends />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
      </Routes>
    </>
  );
}