import { Stack } from "@mui/material";
import MainSection from "./MainSection";
import PresentationSection from "./PresentationSection";
import EndingSection from "./EndingSection";

const Main = () => {
  return (
    <Stack gap="15vh">
      {/* 1번째 섹션 */}
      <MainSection />

      {/* 2번째 섹션 */}
      <PresentationSection
        title="나만의 AI 가이드"
        subTitle="검색보다 빠른 여행 준비"
        description={
          <span>
            어디 갈지, 뭘 먹을지 고민할 필요 없이,
            <br />
            AI 챗봇이 당신의 취향을 분석해 최적의 코스를 제안합니다.
          </span>
        }
        options={[
          {
            title: "AI 챗봇과 대화하기",
            description: "AI와 소통하며 계획을 구상해 보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/ai-trip-plan-generation-1.webm",
          },
          {
            title: "여행 계획 만들기",
            description: "AI와 나눈 대화를 기반으로 여행 계획을 세워보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/ai-trip-plan-generation-2.webm",
          },
        ]}
      />

      {/* 3번째 섹션 */}
      <PresentationSection
        title="직관적인 일정 관리"
        subTitle="복잡한 과정"
        description={
          <span>
            일정부터 위치까지 한눈에 제공되는 여행 템플릿으로
            <br />
            누구나 전문가처럼 계획할 수 있습니다.
          </span>
        }
        options={[
          {
            title: "카드 & 보드",
            description: "일정을 빠르고 간단하게 만들어보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/template-edit.webm",
          },
          {
            title: "일정 한 눈에 보기",
            description: "계획한 일정을 지도로 한 눈에 확인하세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/template-map.webm",
          },
          {
            title: "동시 작업하기",
            description: "여러 사람과 함께 실시간으로 일정을 조정해 보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/template-collaboration.webm",
          },
          {
            title: "일정 내보내기",
            description: "계획한 일정을 다양한 형식으로 내보내 보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/template-export.webm",
          },
        ]}
      />

      {/* 4번째 섹션 */}
      <PresentationSection
        title="함께 나누는 여행"
        subTitle="다른 사람의 여행"
        description={
          <span>
            여행자들의 생생한 후기와 추천 코스를 확인해 보세요.
            <br />
            마음에 드는 코스를 클릭 한 번으로 내 일정에 추가해 보세요.
          </span>
        }
        options={[
          {
            title: "게시글 보기",
            description: "다른 여행자들의 후기를 확인해 보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/browse-posts.webm",
          },
          {
            title: "여행 코스 가져오기",
            description: "마음에 드는 코스를 내 일정에 추가해 보세요.",
            videoSrc: "https://github.com/Vactor0911/wanna-trip/releases/download/videos-v1/copy-post-template.webm",
          },
        ]}
      />

      {/* 5번째 섹션 */}
      <EndingSection />
    </Stack>
  );
};

export default Main;
