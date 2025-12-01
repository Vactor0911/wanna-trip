import { Container, Stack } from "@mui/material";
import SlideSection from "./SlideSection";

const Page2 = () => {
  return (
    <Container maxWidth="xl">
      <Stack minHeight="100vh" py={10}>
        <SlideSection />
      </Stack>
    </Container>
  );
};

export default Page2;
