import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Tooltip from "./Tooltip";

interface SortMenuProps {
  onSortStart: () => void;
  onSortEnd: () => void;
  tooltipTitle?: string;
}

const SortMenu: React.FC<SortMenuProps> = ({
  onSortStart,
  onSortEnd,
  tooltipTitle = "정렬하기",
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortStart = () => {
    onSortStart();
    handleClose();
  };

  const handleSortEnd = () => {
    onSortEnd();
    handleClose();
  };

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton size="small" onClick={handleClick}>
          <SortRoundedIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleSortStart}>
          <ListItemIcon>
            <AccessTimeRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>시작 시간 순</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSortEnd}>
          <ListItemIcon>
            <ScheduleRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>종료 시간 순</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SortMenu;
