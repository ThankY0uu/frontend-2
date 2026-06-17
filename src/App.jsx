import {Routes, Route} from 'react-router';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Discussions from './pages/Discussions';
import Header from './components/Header';

export default function App() {
    return (
        <>
            <Header/>
            <Routes>
                <Route path="/discussions" element={<Discussions/>}/>
                <Route path="/" element={
                    <PrivateRoute>
                        <Home/>
                    </PrivateRoute>
                }/>
                <Route path="/login" element={<Auth mode="login"/>}/>
                <Route path="/register" element={<Auth mode="register"/>}/>
            </Routes>
        </>
    );
}
