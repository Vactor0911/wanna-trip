import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./utils";
import { CssBaseline } from "@mui/material";
import TokenRefresher from "./components/TokenRefresher";
import { Login, Main, Register, Template } from "./pages";
import Header from "./components/Header";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/wanna-trip">
        <TokenRefresher>
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/template" element={<Template />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TokenRefresher>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
