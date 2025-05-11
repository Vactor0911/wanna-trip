import {
  FormControl,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps,
} from "@mui/material";

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
          transform: "translate(14px, 18px)",
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
          transform: "translateY(5px)",
          fontWeight: 700,
          color: "#404040",
          borderRadius: "8px"
        }}
      />
    </FormControl>
  );
};

export default OutlinedTextField;
