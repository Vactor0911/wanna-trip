import styled from "@emotion/styled";

// Props 타입 정의
interface ContentProps {
  time: string;
  activity: string;
  image: string;
}

const ContentStyle = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;

  .time {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .activity {
    font-size: 1rem;
    margin-bottom: 5px;
    text-align: center;
  }

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const Content = ({ time, activity, image }: ContentProps) => {
  return (
    <ContentStyle>
      <div className="time">{time}</div>
      <div className="activity">{activity}</div>
      <img src={image} alt={activity} />
    </ContentStyle>
  );
};

export default Content;
