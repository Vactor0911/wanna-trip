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
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873266-6c0fb3ce-5415-4f78-9762-d87f5ba84f6f.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122826Z&X-Amz-Expires=300&X-Amz-Signature=26ba955d34a66f19426bdc56a1f0650452751417b321695e1a055b3e84661f3d&X-Amz-SignedHeaders=host",
          },
          {
            title: "여행 계획 만들기",
            description: "AI와 나눈 대화를 기반으로 여행 계획을 세워보세요.",
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873423-d5293185-5aaf-4557-a544-ceff41c3f3d3.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122832Z&X-Amz-Expires=300&X-Amz-Signature=ddf14a9e100c03ad751fb3839bc23fa63baea68264c94e061f0f8029382d46cb&X-Amz-SignedHeaders=host",
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
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873667-51834753-1f43-4b91-9afa-b6c2ebc95b83.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122842Z&X-Amz-Expires=300&X-Amz-Signature=1560a1999d2799ee8b0dc5ee86f140897ab11f0ffcaa763f063a15e8fd505d80&X-Amz-SignedHeaders=host",
          },
          {
            title: "일정 한 눈에 보기",
            description: "계획한 일정을 지도로 한 눈에 확인하세요.",
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873723-542eaf08-9a2c-4971-9162-f37d38d95f09.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T123534Z&X-Amz-Expires=300&X-Amz-Signature=6525a96f018ce5e0c10311d286e63dafc9031b2bd26b56134d38c2e8ebe1b95d&X-Amz-SignedHeaders=host",
          },
          {
            title: "동시 작업하기",
            description: "여러 사람과 함께 실시간으로 일정을 조정해 보세요.",
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873793-70af3563-6d11-45cd-a0bc-ec40d22f4745.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122857Z&X-Amz-Expires=300&X-Amz-Signature=944f2c45f01b5d673e7bc86d29b4980f8a100f318e510d46a8534ea450d0c6ef&X-Amz-SignedHeaders=host",
          },
          {
            title: "일정 내보내기",
            description: "계획한 일정을 다양한 형식으로 내보내 보세요.",
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873855-8a74950a-c06a-48a3-ab24-b381b08ebf70.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122910Z&X-Amz-Expires=300&X-Amz-Signature=510680a0668faf31234b2988e84ba4f9a6cbea43fb084ae4454d53ed07d15139&X-Amz-SignedHeaders=host",
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
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521873959-36277689-615c-4f78-8be5-dcf653c77041.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122924Z&X-Amz-Expires=300&X-Amz-Signature=238c90c01a407c45219c6c6f293e1a2e767ee7d3e77cf83945adc141a006f99a&X-Amz-SignedHeaders=host",
          },
          {
            title: "여행 코스 가져오기",
            description: "마음에 드는 코스를 내 일정에 추가해 보세요.",
            videoSrc: "https://github-production-user-asset-6210df.s3.amazonaws.com/85281049/521874022-30d516d2-db59-4023-92e5-97745dece3b2.webm?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251203%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251203T122931Z&X-Amz-Expires=300&X-Amz-Signature=15878c022a7e3783ce6b8facf22f95f8166c23d8c16d1c95f338b7d0e333bb62&X-Amz-SignedHeaders=host",
          },
        ]}
      />

      {/* 5번째 섹션 */}
      <EndingSection />
    </Stack>
  );
};

export default Main;
