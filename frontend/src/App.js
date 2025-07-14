import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import './App.css';
import Dashboard                  from './routes/dashboard';
import Login                      from './routes/login';
import Register                   from './routes/register';
import UploadFirmware             from './routes/upload';
import { RequireAdmin }           from './auth/required'; 
import { number } from "framer-motion";

function AdminLayout() {
  // Any shared header / nav for all admin pages goes here
  return (
    <div>
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/"           element={<Login/>} />
        <Route path="/register"   element={<Register/>} />
        <Route path="/upload"     element={<UploadFirmware/>} />
        <Route path="/dashboard"  element={<Dashboard/>} />
        <Route path="/logout"     element={<Login/>} />

        {/* Admin parent route – must NOT self-close */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;