import {
  FormControl,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps,
} from "@mui/material";
import { theme } from "../utils/theme";

interface OutlinedTextFieldProps extends OutlinedInputProps {
  label: string;
  endAdornment?: React.ReactNode;
}

const OutlinedTextField = (props: OutlinedTextFieldProps) => {
  const { label, endAdornment, ...others } = props;

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
      }}
    >
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        endAdornment={endAdornment}
        label={label}
        {...others}
        sx={{
          fontWeight: 700,
          color: theme.palette.black.main,
          borderRadius: "8px",
          overflow: "hidden",
          "& input": {
            transform: "translateY(5px)",
          },
          "& fieldset": {
            top: 0,
          },
        }}
      />
    </FormControl>
  );
};

export default OutlinedTextField;
