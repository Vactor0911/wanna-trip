import { Container, Stack } from "@mui/material";
import SlideSection from "./SlideSection";

const PresentationSection = () => {
  return (
    <Container maxWidth="xl">
      <Stack minHeight="100vh" py={10}>
        <SlideSection />
      </Stack>
    </Container>
  );
};

export default PresentationSection;
