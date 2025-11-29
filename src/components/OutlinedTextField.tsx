import {
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps,
  useTheme,
} from "@mui/material";

interface OutlinedTextFieldProps extends OutlinedInputProps {
  label: string;
  endAdornment?: React.ReactNode;
  helperText?: string;
}

const OutlinedTextField = (props: OutlinedTextFieldProps) => {
  const { label, endAdornment, helperText, error, sx, ...others } = props;
  const theme = useTheme();

  return (
    <FormControl
      variant="outlined"
      fullWidth
      sx={{
        "& label.MuiFormLabel-root": {
          transform: "translate(14px, 16px)",
        },
        "& label.MuiFormLabel-root.MuiFormLabel-filled, & label.MuiFormLabel-root.Mui-focused":
          {
            transform: "translate(14px, 6px) scale(0.65)",
          },
        "& legend": {
          display: "none",
        },
        ...sx,
      }}
    >
      <InputLabel error={error}>{label}</InputLabel>
      <OutlinedInput
        endAdornment={endAdornment}
        label={label}
        error={error}
        {...others}
        sx={{
          fontWeight: 700,
          color: others.readOnly
            ? theme.palette.text.disabled
            : theme.palette.text.primary,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: others.readOnly
            ? theme.palette.secondary.main
            : theme.palette.background.paper,
          "& input": {
            padding: "21.5px 14px 11.5px 14px",
          },
          "& fieldset": {
            top: 0,
          },
        }}
      />
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </FormControl>
  );
};

export default OutlinedTextField;
