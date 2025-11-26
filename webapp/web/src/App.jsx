import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import AdminPanel from './pages/AdminPanel';
import UserDashboard from './pages/UserDashboard';
import Register from './pages/register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<Login />} />
        <Route path ="/register" element={<Register/>}></Route>
        {/*
           <Route path="/dashboard" element={<Dashboard />} /> 
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;