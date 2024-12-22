import React, { ReactElement } from "react";
import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material";

interface MyButtonProps extends ButtonProps {
  startIcon?: React.ReactNode;
  textColor?: string;
}

const MyButton = (props: MyButtonProps) => {
  const { children, startIcon, onClick, disabled, textColor } = props;
  return (
    <Button
      variant="contained"
      startIcon={
        React.isValidElement(startIcon) && typeof startIcon.type !== "string"
          ? React.cloneElement(startIcon as ReactElement, {
              style: { ...(startIcon.props.style || {}), fontSize: "2em" },
            })
          : startIcon
      }
      sx={{
        fontWeight: "bold",
        backgroundColor: "#dcdfe4",
        color: textColor || "#4b6079",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default MyButton;
