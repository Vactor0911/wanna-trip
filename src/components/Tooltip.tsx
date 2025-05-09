import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from "@mui/material";

const Tooltip = (props: MuiTooltipProps) => {
  return (
    <MuiTooltip {...props} arrow>
      {props.children}
    </MuiTooltip>
  );
};

export default Tooltip;
