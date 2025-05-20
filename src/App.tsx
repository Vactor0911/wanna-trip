import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./utils/theme";
import { Container, CssBaseline } from "@mui/material";
import TokenRefresher from "./components/TokenRefresher";
import {
  UserTemplates,
  Login,
  Main,
  Register,
  FindPassword,
  ChangePassword,
  Template,
} from "./pages";
import Header from "./components/Header";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/wanna-trip">
        <TokenRefresher>
          <Header />
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/userTemplates" element={<UserTemplates/>} />
              <Route path="/find-password" element={<FindPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Routes>
          </Container>
          <Routes>
            <Route path="/template" element={<Template />} />
            <Route path="/template/:uuid" element={<Template />} />
          </Routes>

        </TokenRefresher>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
