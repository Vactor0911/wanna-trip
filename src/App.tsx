import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./utils/theme";
import { CssBaseline } from "@mui/material";
import TokenRefresher from "./components/TokenRefresher";
import {
  UserTemplates,
  Login,
  Main,
  Register,
  FindPassword,
  ChangePassword,
  Template,
  Community,
  Myinformation,
  News,
  NewsPost,
} from "./pages";
import CommunityPost from "./pages/CommunityPost";
import Header from "./components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommunityPostEdit from "./pages/CommunityPostEdit";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/wanna-trip">
          <TokenRefresher>
            <Header />
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/template" element={<UserTemplates />} />
              <Route path="/template/:uuid" element={<Template />} />
              <Route path="/myinformation" element={<Myinformation />} />
              <Route path="/find-password" element={<FindPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/edit" element={<CommunityPostEdit />} />
              <Route path="/news" element={<News />} />
              <Route
                path="/community/:postUuid/edit"
                element={<CommunityPostEdit />}
              />
              <Route path="/community/:postUuid" element={<CommunityPost />} />
              <Route path="/news/:newsId" element={<NewsPost />} />
            </Routes>
          </TokenRefresher>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
