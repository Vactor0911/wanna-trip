import {
  Dialog,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import { useCallback, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NaverMap from "./NaverMap";

interface FullScreenMapDialogProps {
  open: boolean;
  onClose: () => void;
  lat?: number;
  lng?: number;
  zoom?: number;
}

const FullScreenMapDialog = ({
  open,
  onClose,
  lat = 37.5665,
  lng = 126.978,
  zoom = 13,
}: FullScreenMapDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 검색어 입력 핸들러
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    // TODO: 실제 검색 로직 구현
    console.log("검색어:", searchQuery);
  }, [searchQuery]);

  // Enter 키 입력 시 검색 실행
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          margin: 0,
          borderRadius: 0,
        },
      }}
    >
      {/* 헤더 */}
      <DialogTitle sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" gap={2}>
          {/* 검색 입력창 */}
          <TextField
            fullWidth
            placeholder="장소를 검색하세요"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
              },
            }}
          />

          {/* 닫기 버튼 */}
          <IconButton onClick={onClose} size="large">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* 지도 영역 */}
      <Box flex={1} position="relative">
        <NaverMap
          width="100%"
          height="100%"
          lat={lat}
          lng={lng}
          zoom={zoom}
          interactive={true} // 전체화면에서는 상호작용 가능
          sx={{
            borderRadius: 0,
          }}
        />
      </Box>
    </Dialog>
  );
};

export default FullScreenMapDialog;