import { Routes, Route } from 'react-router';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Header from './components/Header';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
      </Routes>
    </>
  );
}