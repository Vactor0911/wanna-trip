import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";  // Main 컴포넌트
import Login from "./pages/Login"; // Login 컴포넌트
import Template from "./pages/Template"; // Template 컴포넌트
import Register from "./pages/Register"; // Template 컴포넌트

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Template" element={<Template />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
