import 서울Image from "../images/서울.jpg";
import 부산Image from "../images/부산.jpg";
import 강릉Image from "../images/강릉.jpg";
import 인천Image from "../images/인천.jpg";
import 경주Image from "../images/경주.jpg";
import 제주Image from "../images/제주.jpg";
import 속초Image from "../images/속초.jpg";
import 여수Image from "../images/여수.jpg";

const regionalImages: { [key: string]: string } = {
  서울: 서울Image,
  부산: 부산Image,
  강릉: 강릉Image,
  인천: 인천Image,
  경주: 경주Image,
  제주: 제주Image,
  속초: 속초Image,
  여수: 여수Image,
};

// 지역 이름 목록
const regionNames = Object.keys(regionalImages);

export const travelRegions = regionNames.map((regionName) => ({
  name: regionName,
  image: regionalImages[regionName],
}));
