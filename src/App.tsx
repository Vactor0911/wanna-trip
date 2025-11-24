import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./utils/theme";
import { CssBaseline, IconButton } from "@mui/material";
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
import { closeSnackbar, SnackbarProvider } from "notistack";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider theme={theme}>
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
              <Header />
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/template" element={<UserTemplates />} />
                <Route path="/template/:templateUuid" element={<Template />} />
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
                <Route
                  path="/community/:postUuid"
                  element={<CommunityPost />}
                />
                <Route path="/news/:newsId" element={<NewsPost />} />
              </Routes>
            </SnackbarProvider>
          </TokenRefresher>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
