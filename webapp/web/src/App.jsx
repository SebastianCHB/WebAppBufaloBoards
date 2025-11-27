import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import AdminPanel from './pages/AdminPanel';
import UserDashboard from './pages/UserDashboard';
import BoardView from './pages/BoardView';
import Register from './pages/register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
        </Route>
        <Route path="/board/:id" element={<BoardView />} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;