import {
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import {
  drawerOpenAtom,
  locationDialogAnchor,
  LocationInterface,
  selectedLocationAtom,
} from "../../state/naverMapDialog";
import { useCallback, useRef } from "react";
import { useSetAtom } from "jotai";

const NaverMapSearchItem = (props: LocationInterface) => {
  const { title, address, category = "" } = props;

  const setSelectedLocation = useSetAtom(selectedLocationAtom);
  const searchItemRef = useRef<HTMLDivElement | null>(null);
  const setLocationDialogAchor = useSetAtom(locationDialogAnchor);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const setDrawerOpen = useSetAtom(drawerOpenAtom);

  const handleButtonClick = useCallback(() => {
    // 클릭한 버튼 요소가 부적절하면 종료
    if (!searchItemRef.current) {
      return;
    }

    console.log("검색 아이템 클릭:", props);

    // 선택한 장소 정보 설정
    setSelectedLocation(props);

    // 클릭한 버튼으로 앵커 설정
    setLocationDialogAchor(searchItemRef.current);

    // 모바일이면 드로어 메뉴 닫기
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [
    isMobile,
    props,
    setDrawerOpen,
    setLocationDialogAchor,
    setSelectedLocation,
  ]);

  return (
    <Paper elevation={0} ref={searchItemRef}>
      <Button
        fullWidth
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
          padding: 1,
        }}
        onClick={handleButtonClick}
      >
        {/* 제목 */}
        <Typography
          variant="subtitle1"
          display="inline-flex"
          alignItems="center"
          fontWeight="bold"
        >
          <LocationOnRoundedIcon
            color="primary"
            sx={{
              mr: 1,
            }}
          />
          {title.replace(/<[^>]*>/g, "")}
        </Typography>

        {/* 주소 */}
        <Typography variant="subtitle1" color="black">
          {address}
        </Typography>

        {/* 카테고리 */}
        <Typography variant="subtitle2" color="text.secondary">
          {category}
        </Typography>
      </Button>
    </Paper>
  );
};

export default NaverMapSearchItem;
