import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard';
import Home from './pages/Home';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <div className="w-full max-w-full overflow-x-hidden min-h-screen">
            <Routes>
                {/* Home */}
                <Route path='/' element={<Home />} />

                {/* Routes publiques */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Routes protégées */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;