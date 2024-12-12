import React, { ReactElement } from "react";
import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material";

interface MyButtonProps extends ButtonProps {
  startIcon?: React.ReactNode;
}

const MyButton = (props: MyButtonProps) => {
  const { children, startIcon } = props;
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
        color: "#4b6079",
      }}
    >
      {children}
    </Button>
  );
};

export default MyButton;
