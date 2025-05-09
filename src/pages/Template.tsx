import styled from "@emotion/styled";
import { CardInterface, color, timeStringToDayjs } from "../utils/index";
import MyButton from "../components/MyButton";
import { useCallback, useEffect, useRef } from "react";
import { Fade, Paper, Popper, PopperPlacementType } from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MyIconButton from "../components/MyIconButton";
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  boardDataAtom,
  kakaoLoginStateAtom,
  popupMenuStateAtom,
  PopupMenuType,
  SERVER_HOST,
  templateDataAtom,
  wannaTripLoginStateAtom,
} from "../state";
import axios from "axios";
import { BoardMenu, CardMenu, MobileMenu } from "../components/Popups";
import Board from "../components/Board";
import {
  BoardDeleteDialog,
  BoardSwapDialog,
  CardDeleteDialog,
  CardSwapDialog,
} from "../components/Dialogs";
import { useNavigate } from "react-router";
import LoginButton from "../components/LoginButton";
import axiosInstance, { getCsrfToken } from "../utils/axiosInstance";
import { resetStates } from "../utils/index";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: ${color.background};

  .flex {
    display: flex;
    align-items: center;
  }

  & > header {
    justify-content: space-between;
    width: 100%;
    height: 80px;
    padding: 10px 20px;
    background-color: ${color.primary};
  }

  .main-container {
    justify-content: flex-end;
    position: relative;
    width: 100%;
    height: calc(100% - 80px);
  }

  .template-container {
    display: flex;
    flex-direction: column;
    width: calc(100% - 50px);
    height: 100%;
  }

  .template-container > header {
    justify-content: space-between;
    padding: 5px 20px;
    padding-left: 40px;
    width: 100%;
    height: 80px;
    background-color: ${color.primaryDark};
  }

  .template-container > header .btn-container {
    gap: 15px;
  }

  .template-container > header .btn-container #btn-template-menu {
    display: none;
  }

  .template {
    display: flex;
    height: 100%;
    padding: 20px 40px;
    gap: 20px;
  }

  .flex-menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 50px;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    background-color: ${color.primaryLight};
  }

  #template-scrollbar {
    width: 100%;
    height: 100%;
    display: flex;
  }
  #template-scrollbar > div {
    display: flex;
  }

  @media (max-width: 480px) {
    & > header,
    .template-container > header {
      height: 60px;
    }

    .main-container {
      height: calc(100% - 60px);
    }

    .template-container {
      width: calc(100% - 25px);
    }

    .template-container > header .btn-container button:not(#btn-template-menu) {
      display: none;
    }
    .template-container > header .btn-container #btn-template-menu {
      display: inline-flex;
    }

    .template {
      padding: 20px 1vw;
    }

    .flex-menu {
      width: 25px;
    }
  }

  .os-scrollbar {
    --os-size: 10px;
    --os-handle-bg: white;
    --os-handle-border-radius: 2px;
    --os-handle-border: 1px solid #aaa;
  }
`;

const Template = () => {
  // 카카오 로그인 상태 초기화
  const setKakaoLoginState = useSetAtom(kakaoLoginStateAtom);
  useEffect(() => {
    setKakaoLoginState(""); // 카카오 로그인 상태 초기화
  }, [setKakaoLoginState]);

  // 모바일용 템플릿 메뉴 팝업
  const anchorTemplateMenu = useRef<HTMLButtonElement>(null); // 팝업 기준 엘리먼트

  // 팝업 메뉴 상태
  const [popupMenuState, setPopupMenuState] = useAtom(popupMenuStateAtom);

  const handleTemplateMenuClicked = useCallback(() => {
    // 클릭 이벤트 핸들러
    const newPopupMenuState = {
      isOpen: !popupMenuState.isOpen,
      type: PopupMenuType.MOBILE,
      anchor: anchorTemplateMenu.current,
      placement: "bottom-end",
      board: null,
      card: null,
    };

    setPopupMenuState(newPopupMenuState);
  }, [popupMenuState.isOpen, setPopupMenuState]);

  // 팝업 메뉴 외부 클릭시 닫기
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        popupMenuState.isOpen &&
        popupMenuState.anchor &&
        !popupMenuState.anchor.contains(event.target as Node)
      ) {
        setPopupMenuState((prevState) => ({
          ...prevState,
          isOpen: false,
        }));
      }
    },
    [popupMenuState.anchor, popupMenuState.isOpen, setPopupMenuState]
  );

  const navigate = useNavigate();
  const { isLoggedIn } = useAtomValue(wannaTripLoginStateAtom); // 로그인 상태 읽기
  const setWannaTripLoginState = useSetAtom(wannaTripLoginStateAtom); // 상태 업데이트
  
  useEffect(() => {
    const savedLoginState = localStorage.getItem("WannaTriploginState");
    if (savedLoginState) {
      setWannaTripLoginState(JSON.parse(savedLoginState));
    }
  }, [setWannaTripLoginState]);


  // 로그아웃 기능 구현 시작
  const handleLogoutClick = useCallback(async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다."); // 로그인 상태가 아닌 경우 알림
      return;
    }

    // CSRF 토큰 가져오기
    const csrfToken = await getCsrfToken();

    const response = await axiosInstance.post(
      "/api/auth/logout",
      {

      },
      {
        headers: {
          "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
        },
      }
    );

    try {
      if (response.data.success) {
        // Jotai 상태
        //TODO: 이거 리셋 함수 해줘요
        resetStates(setWannaTripLoginState); // 상태 초기화

        alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지

        navigate("/"); // 메인 페이지로 이동
      } else {
        alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
    }
  }, [isLoggedIn, navigate, setWannaTripLoginState]);
  // 로그아웃 기능 구현 끝

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // 보드 정보
  const [templateData, setTemplateData] = useAtom(templateDataAtom);
  const [boardData, setBoardData] = useAtom(boardDataAtom);

  // 최초 접속시 템플릿 정보 불러오기
  const wannaTripLoginState = useAtomValue(wannaTripLoginStateAtom);
  useEffect(() => {
    // 비로그인 상태일 경우 종료
    if (!wannaTripLoginState.isLoggedIn) {
      return;
    }

    const userUuid = wannaTripLoginState.userUuid;
    axios
      .post(`${SERVER_HOST}/api/template`, { userUuid: userUuid })
      .then((res) => {
        const template = res.data.template;

        setTemplateData({ id: template.template_id, title: template.title });
      })
      .then(() => {
        const templateId = templateData.id;
        axios
          .post(`${SERVER_HOST}/api/card?type=load-all`, {
            templateId: templateId,
          })
          .then((res) => {
            const cards = res.data.cards;
            const newBoardData = Array<CardInterface[]>();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cards.forEach((card: any) => {
              const boardIndex = card.board;
              const newCard = {
                id: card.card_id,
                type: card.type,
                content: card.content,
                startTime: timeStringToDayjs(card.start_time).format("HH:mm"),
                endTime: timeStringToDayjs(card.end_time).format("HH:mm"),
              } as CardInterface;

              if (!newBoardData[boardIndex]) {
                newBoardData[boardIndex] = [newCard];
              } else {
                newBoardData[boardIndex].push(newCard);
              }
            });

            setBoardData(newBoardData);
          });
      });
  }, [setBoardData, setTemplateData, templateData.id, wannaTripLoginState]);

  return (
    <>
      <Style>
        {/* 헤더 */}
        <header className="flex">
          <div className="logo-container flex">
            <h1 style={{ color: "white" }}>여행갈래</h1>
          </div>
          <div className="btn-container flex">
            {isLoggedIn ? (
              // 로그아웃 기능 추가
              <LoginButton onClick={handleLogoutClick} />
            ) : (
              <MyButton variant="contained" onClick={() => navigate("/login")}>
                로그인/회원가입
              </MyButton>
            )}
          </div>
        </header>

        {/* 메인 부분 */}
        <div className="main-container flex">
          {/* 템플릿 부분 */}
          <div className="template-container">
            {/* 템플릿 헤더 */}
            <header className="flex">
              <h2 style={{ color: "white" }}>{templateData.title}</h2>
              <div className="btn-container flex">
                <MyButton startIcon={<DownloadIcon />}>저장하기</MyButton>
                <MyButton startIcon={<SaveIcon />}>다운로드</MyButton>

                {/* 모바일용 메뉴 팝업 버튼 */}
                <MyIconButton
                  id="btn-template-menu"
                  ref={anchorTemplateMenu}
                  onClick={handleTemplateMenuClicked}
                >
                  <MoreVertIcon />
                </MyIconButton>
              </div>
            </header>

            {/* 템플릿 내용 */}
            <OverlayScrollbarsComponent id="template-scrollbar">
              <div className="template">
                {Array.from({ length: Math.max(boardData.length, 1) }).map(
                  (_board, index) => (
                    <Board key={index} day={index} />
                  )
                )}
              </div>
            </OverlayScrollbarsComponent>
          </div>

          {/* 좌측 확장 메뉴 */}
          <div className="flex-menu"></div>
        </div>
      </Style>

      {/* 팝업 메뉴 */}
      <Popper
        open={popupMenuState.isOpen}
        anchorEl={popupMenuState?.anchor}
        placement={popupMenuState?.placement as PopperPlacementType}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {popupMenuState?.type === PopupMenuType.MOBILE && <MobileMenu />}
              {popupMenuState?.type === PopupMenuType.BOARD && <BoardMenu />}
              {popupMenuState?.type === PopupMenuType.CARD && <CardMenu />}
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* 대화상자 */}
      <BoardDeleteDialog />
      <CardDeleteDialog />
      <BoardSwapDialog />
      <CardSwapDialog />
    </>
  );
};

export default Template;
