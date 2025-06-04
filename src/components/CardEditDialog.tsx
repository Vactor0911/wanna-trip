import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useAtom } from "jotai";
import { cardEditDialogOpenAtom } from "../state";
import { useCallback, useState } from "react";
import { theme } from "../utils/theme";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import Tooltip from "./Tooltip";
import CardTextEditor from "./text_editor/CardTextEditor";

const CardEditDialog = () => {
  const [cardEditDialogOpen, setCardEditDialogOpen] = useAtom(
    cardEditDialogOpenAtom
  );
  const [isCardLocked, setIsCardLocked] = useState(false); // 카드 잠금 상태

  // 카드 편집 대화상자 닫기
  const handleCardEditDialogClose = useCallback(() => {
    setCardEditDialogOpen(false);
  }, [setCardEditDialogOpen]);

  // 카드 잠금 토글
  const handleCardLockToggle = useCallback(() => {
    setIsCardLocked((prev) => !prev);
  }, [setIsCardLocked]);

  return (
    <Dialog
      fullWidth
      open={cardEditDialogOpen}
      onClose={handleCardEditDialogClose}
      maxWidth="md"
    >
      {/* 제목 */}
      <DialogTitle
        sx={{
          paddingX: {
            xs: 2,
            sm: 5,
          },
        }}
      >
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            {/* 카드 잠금 버튼 */}
            <Tooltip
              title={isCardLocked ? "카드 잠금 풀기" : "카드 잠그기"}
              placement="top"
            >
              <IconButton
                color="primary"
                size="small"
                onClick={handleCardLockToggle}
              >
                {isCardLocked ? (
                  <LockOutlineRoundedIcon fontSize="large" />
                ) : (
                  <LockOpenRoundedIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>

            {/* 카드 제목 */}
            <Typography variant="h4">카드 편집 대화상자 - Day 1</Typography>
          </Stack>

          {/* 구분선 */}
          <Divider />
        </Stack>
      </DialogTitle>

      {/* 내용 */}
      <Stack
        px={{
          xs: 2,
          sm: 5,
        }}
        pb={3}
        gap={3}
      >
        <Stack
          direction={{
            sm: "column",
            md: "row",
          }}
          justifyContent="space-between"
          gap={{
            xs: 5,
            md: 0,
          }}
        >
          {/* 텍스트 편집기 */}
          <Box
            width={{
              xs: "100%",
              md: "70%",
            }}
            height="400px"
          >
            <CardTextEditor />
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
              md: "column",
            }}
            gap={1}
          >
            {/* 지도 뷰어 */}
            <Skeleton
              variant="rectangular"
              sx={{
                borderRadius: 2,
                width: {
                  xs: "200px",
                },
                height: {
                  xs: "200px",
                },
              }}
            />

            <Stack>
              {/* 선택된 장소 설명 */}
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  color: theme.palette.black.main,
                }}
              >
                <PlaceRoundedIcon />
                <Typography variant="h6">장소</Typography>
              </Stack>

              {/* 시간 선택기 */}
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  color: theme.palette.black.main,
                }}
              >
                <AccessTimeRoundedIcon />
                <Typography variant="h6" flex={1}>
                  시간
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* 버튼 컨테이너 */}
        <Stack
          direction="row"
          gap={2}
          alignSelf="flex-end"
          color={theme.palette.black.main}
        >
          {/* 취소 버튼 */}
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              px: 3,
            }}
            onClick={handleCardEditDialogClose}
          >
            <Typography>취소</Typography>
          </Button>

          {/* 저장 버튼 */}
          <Button
            variant="contained"
            sx={{
              px: 3,
            }}
          >
            <Typography>저장</Typography>
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default CardEditDialog;
