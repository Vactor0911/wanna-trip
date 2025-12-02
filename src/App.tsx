import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./utils/theme";
import { CssBaseline, IconButton, ThemeProvider } from "@mui/material";
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
  NewsEdit,
  LikedPosts,
} from "./pages";
import CommunityPost from "./pages/CommunityPost";
import Header from "./components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommunityPostEdit from "./pages/CommunityPostEdit";
import { closeSnackbar, SnackbarProvider } from "notistack";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/wanna-trip">
          <TokenRefresher>
            <SnackbarProvider
              maxSnack={3}
              action={(snackbarId) => (
                <IconButton
                  color="inherit"
                  sx={{ p: 0.5 }}
                  onClick={() => closeSnackbar(snackbarId)}
                >
                  <CloseRoundedIcon />
                </IconButton>
              )}
            >
              {/* 헤더 */}
              <Header />

              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/template" element={<UserTemplates />} />
                <Route path="/template/:templateUuid" element={<Template />} />
                <Route path="/myinformation" element={<Myinformation />} />
                <Route path="/liked-posts" element={<LikedPosts />} />
                <Route path="/find-password" element={<FindPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/edit" element={<CommunityPostEdit />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/create" element={<NewsEdit />} />
                <Route path="/news/edit/:newsUuid" element={<NewsEdit />} />
                <Route
                  path="/community/:postUuid/edit"
                  element={<CommunityPostEdit />}
                />
                <Route
                  path="/community/:postUuid"
                  element={<CommunityPost />}
                />
                <Route path="/news/:newsUuid" element={<NewsPost />} />
              </Routes>

              {/* 푸터 */}
              <Footer />
            </SnackbarProvider>
          </TokenRefresher>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
