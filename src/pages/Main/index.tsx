import { Stack } from "@mui/material";
import Page1 from "./Page1";
import Page2 from "./Page2";
import EndingSection from "./EndingSection";

const Main = () => {
  return (
    <Stack gap="10vh">
      <Page1 />
      <Page2 />
      <Page2 />
      <Page2 />
      <EndingSection />
    </Stack>
  );
};

export default Main;
