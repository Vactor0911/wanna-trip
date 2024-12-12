import styled from "@emotion/styled";
import { color } from "../utils/theme";
import MyButton from "../components/MyButton";
import { useCallback, useRef, useState } from "react";
import { Fade, Paper, Popper } from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MyIconButton from "../components/MyIconButton";
import Board from "../components/Board";

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
    min-width: 100%;
    height: calc(100% - 80px);
    padding: 20px 40px;
    padding-right: 0;
    gap: 30px;
    overflow-x: scroll;
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

  @media (max-width: 480px) {
    & > header,
    .template-container > header {
      height: 60px;
    }

    .main-container,
    .template {
      height: calc(100% - 60px);
    }

    .template-container {
      width: calc(100% - 25px);
    }

    .template {
      padding: 10px 15px;
    }

    .template-container > header .btn-container button:not(#btn-template-menu) {
      display: none;
    }
    .template-container > header .btn-container #btn-template-menu {
      display: inline-flex;
    }

    .flex-menu {
      width: 25px;
    }

    .board {
      width: 100%;
    }
  }
`;

const Template = () => {
  // 모바일용 템플릿 메뉴 팝업
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false); // 팝업 열림 여부
  const anchorTemplateMenu = useRef<HTMLButtonElement>(null); // 팝업 기준 엘리먼트

  const handleTemplateMenuClicked = useCallback(() => {
    // 클릭 이벤트 핸들러
    setIsTemplateMenuOpen(!isTemplateMenuOpen);
  }, [isTemplateMenuOpen]);

  return (
    <>
      <Style>
        {/* 헤더 */}
        <header className="flex">
          <div className="logo-container flex">
            <h1 style={{ color: "white" }}>여행갈래</h1>
          </div>
          <div className="btn-container flex">
            <MyButton>로그인/회원가입</MyButton>
          </div>
        </header>

        {/* 메인 부분 */}
        <div className="main-container flex">
          {/* 템플릿 부분 */}
          <div className="template-container">
            {/* 템플릿 헤더 */}
            <header className="flex">
              <h2 style={{ color: "white" }}>MyTemplate</h2>
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
            <div className="template">
              <Board day={1} />
              <Board day={1} />
            </div>
          </div>

          {/* 좌측 확장 메뉴 */}
          <div className="flex-menu"></div>
        </div>
      </Style>

      {/* 모바일용 메뉴 팝업 */}
      <Popper
        open={isTemplateMenuOpen}
        anchorEl={anchorTemplateMenu.current}
        placement="bottom-end"
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
              <MyButton size="large" startIcon={<DownloadIcon />}>
                저장하기
              </MyButton>
              <MyButton size="large" startIcon={<SaveIcon />}>
                다운로드
              </MyButton>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default Template;
