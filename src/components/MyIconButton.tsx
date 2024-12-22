import { IconButton, IconButtonProps } from "@mui/material";
import React, { forwardRef, ReactElement } from "react";

const MyIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const { children, ...rest } = props;

    return (
      <IconButton
        size="large"
        ref={ref}
        {...rest}
        sx={{
          color: "#dcdfe4",
        }}
      >
        {React.isValidElement(children) && typeof children.type !== "string"
          ? React.cloneElement(children as ReactElement, {
              style: { ...(children.props.style || {}), fontSize: "inherit" },
            })
          : children}
      </IconButton>
    );
  }
);

export default MyIconButton;
