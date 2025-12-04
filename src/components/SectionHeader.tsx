import {
  Box,
  Stack,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";

interface SectionHeaderProps {
  title: string;
  variant?: TypographyProps["variant"];
}

const SectionHeader = (props: SectionHeaderProps) => {
  const { title, variant = "h6" } = props;
  const theme = useTheme();

  return (
    <Stack position="relative">
      <Typography
        variant={variant}
        alignSelf="flex-start"
        padding="6px 32px"
        position="relative"
        sx={{
          "&:after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "2px",
            bottom: 0,
            left: 0,
            bgcolor: theme.palette.primary.main,
            borderRadius: "50px",
            zIndex: 2,
          },
        }}
      >
        {title}
      </Typography>
      <Box
        position="absolute"
        width="100%"
        height="2px"
        bottom={0}
        left={0}
        bgcolor={theme.palette.text.secondary}
        borderRadius="50px"
      />
    </Stack>
  );
};

export default SectionHeader;
