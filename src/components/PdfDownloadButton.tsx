import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Tooltip from "./Tooltip";
import { downloadPdf, TemplateData } from "../utils/pdfExport";

interface PdfDownloadButtonProps {
  template: TemplateData;
  onDownloadStart?: () => void;
  onDownloadComplete?: (success: boolean, message: string) => void;
  tooltipTitle?: string;
  size?: "small" | "medium" | "large";
}

const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  template,
  onDownloadStart,
  onDownloadComplete,
  tooltipTitle = "PDF 다운로드",
  size = "small",
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      onDownloadStart?.();

      const result = downloadPdf(template);

      onDownloadComplete?.((await result).success, (await result).message);
    } catch (error) {
      console.error("PDF 다운로드 오류:", error);
      onDownloadComplete?.(false, "PDF 다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton size={size} onClick={handleClick} disabled={isDownloading}>
          {isDownloading ? (
            <CircularProgress size={20} />
          ) : (
            <PictureAsPdfRoundedIcon />
          )}
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
        <MenuItem onClick={handleDownload} disabled={isDownloading}>
          <ListItemIcon>
            <DownloadRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {isDownloading ? "다운로드 중..." : "PDF 파일 다운로드"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PdfDownloadButton;
