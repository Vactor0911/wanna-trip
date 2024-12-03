import styled from "@emotion/styled";

// Props 타입 정의
interface CardProps {
  time: string;
  activity: string;
}

const CardtStyle = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 10px;
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
    object-fit: cover;
    border-radius: 8px;
  }
`;

const Card = ({ time, activity}: CardProps) => {
  return (
    <CardtStyle>
      <div className="time">{time}</div>
      <div className="activity">{activity}</div>
    </CardtStyle>
  );
};

export default Card;
