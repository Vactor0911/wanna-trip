import { Stack } from "@mui/material";
import Page1 from "./Page1";
import Page2 from "./Page2";

const Main = () => {
  return (
    <Stack gap="10vh">
      <Page1 />
      <Page2 />
      <Page2 />
      <Page2 />
    </Stack>
  );
};

export default Main;
