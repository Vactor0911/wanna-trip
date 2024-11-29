import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login"; // Login 컴포넌트
import Register from "./pages/Register"; // Register 컴포넌트
import Template from "./pages/Template"; // Template 컴포넌트
import NewTemplate from "./pages/NewTemplate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/template" element={<Template />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;