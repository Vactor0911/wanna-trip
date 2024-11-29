import styled from "@emotion/styled";
import PersonIcon from "@mui/icons-material/Person"; // 사람 아이콘 추가
import React from "react";

const LoginButtonStyle = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #64748b;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease-out;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1);
  }
`;

const LoginButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <LoginButtonStyle onClick={onClick}>
      <PersonIcon
        sx={{
          fill: "white",
          transform: "scale(1.5)",
        }}
      />
    </LoginButtonStyle>
  );
};

export default LoginButton;
