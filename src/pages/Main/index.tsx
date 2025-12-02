import { Stack } from "@mui/material";
import MainSection from "./MainSection";
import PresentationSection from "./PresentationSection";
import EndingSection from "./EndingSection";

const Main = () => {
  return (
    <Stack gap="15vh">
      <MainSection />
      <PresentationSection />
      <PresentationSection />
      <PresentationSection />
      <EndingSection />
    </Stack>
  );
};

export default Main;
