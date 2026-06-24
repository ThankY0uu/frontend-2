import {Routes, Route} from 'react-router';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Music from './pages/explorer-pages/music';
import Drama from './pages/explorer-pages/drama';
import Home from './pages/Home';
import Discussions from './pages/explorer-pages/Discussions';
import Header from './components/Header';
import Profile from './pages/users/Profile';
import PublicProfile from './pages/users/PublicProfile';
import Users from './pages/users/discover';
import Friends from './pages/users/friends';
import Requests from './pages/users/requests';
import Privacy from './pages/explorer-pages/Privacy';

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
        <Route path="explorer-pages/Discussions" element={<Discussions />} />
        <Route path="explorer-pages/drama" element={<Drama />} />
        <Route path="explorer-pages/music" element={<Music />} />
        <Route path="users/profile" element={
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
        <Route path="explorer-pages/privacy" element={<Privacy />} />
        <Route path="/requests" element={
          <PrivateRoute>
            <Requests />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
      </Routes>
    </>
  );
}