import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Dashboard      from './routes/dashboard';
import Login          from './routes/login';
import Register       from './routes/register';
import UploadFirmware from './routes/upload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/upload" element={<UploadFirmware/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/logout" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;