import styled from "@emotion/styled";
import { useState } from "react";
import { Link } from "react-router-dom";
import BackgroundImage from "../assets/images/background.png";
import { color } from "../utils/theme";
import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import NaverIcon from "../assets/images/naver.png";
import GoogleIcon from "../assets/images/google.png";

const Style = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: ${color.background_main};
  z-index: 1;

  &:before {
    content: "";
    position: absolute;
    width: 40%;
    height: 100vh;
    top: 0;
    left: 5%;
    background-image: url(${BackgroundImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    z-index: -1;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 35%;
    min-width: 400px;
    height: 100%;
    margin-right: 10%;
    gap: 1em;
  }

  .title {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: white;
  }
  .title h1 {
    font-size: 2.3em;
  }
  .title p {
    font-size: 1.6em;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .checkbox-container {
    display: flex;
    flex-direction: column;
  }

  .button-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p.register {
    align-self: center;
    color: white;
    word-spacing: 3px;
    font-size: 1.3em;
  }

  p.register a {
    color: ${color.link};
    margin-left: 5px;
    text-decoration: none;
  }

  p.register a:hover {
    text-decoration: underline;
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 1.5em;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  @media (max-width: 768px) {
    justify-content: center;

    &:before {
      width: 80%;
      left: 10%;
      opacity: 0.3;
    }

    .login-form {
      margin: 0;
      width: 70%;
      min-width: 260px;
    }
  }

  @media (max-width: 480px) {
    &:before {
      width: 100%;
      left: 0;
      opacity: 0.3;
    }

    .button-container {
      flex-direction: column;
      align-items: center;
      align-self: center;
      width: auto;
      gap: 1em;
    }

    .button-wrapper,
    .button-wrapper #btn-login {
      width: 100%;
    }
  }
`;

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <Style>
      <div className="login-form">
        {/* 타이틀 */}
        <div className="title">
          <h1>여행갈래?</h1>
          <p>세상에서 가장 간단한 계획서</p>
        </div>

        {/* 아이디 입력 */}
        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          placeholder="아이디"
          startAdornment={
            <InputAdornment position="start">
              <PersonRoundedIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
        />

        <div className="wrapper">
          {/* 비밀번호 입력 */}
          <OutlinedInput
            sx={{
              backgroundColor: "#EBEBEB",
              borderRadius: "10px",
            }}
            type={isPasswordVisible ? "text" : "password"}
            placeholder="비밀번호"
            startAdornment={
              <InputAdornment position="start">
                <LockIcon
                  sx={{
                    color: "black",
                    transform: "scale(1.5)",
                    marginRight: "20px",
                  }}
                />
              </InputAdornment>
            }
            // 비밀번호 보임/안보임
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setIsPasswordVisible(!isPasswordVisible);
                  }}
                >
                  {isPasswordVisible ? (
                    <VisibilityIcon sx={{ color: "black" }} />
                  ) : (
                    <VisibilityOffIcon sx={{ color: "black" }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          {/* 버튼과 체크박스 */}
          <div className="button-container">
            <div className="checkbox-container">
              <FormControlLabel
                control={
                  <Checkbox
                    size="large"
                    sx={{
                      color: "#EBEBEB",
                      transform: "translateX(5px)",
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "1em" }}>아이디 저장</Typography>}
                sx={{
                  color: "white",
                  transform: "translate(-5px, 14px)",
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked
                    size="large"
                    sx={{
                      color: "#EBEBEB",
                      transform: "translateX(5px)",
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "1em" }}>로그인 상태 유지</Typography>}
                sx={{
                  color: "white",
                  transform: "translate(-5px, 6px)",
                }}
              />
            </div>
            <div className="button-wrapper">
              <Button
                id="btn-login"
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  fontWeight: "bold",
                  fontSize: "1.4em",
                  padding: "7px 30px",
                }}
              >
                로그인
              </Button>
            </div>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <p className="register">
          계정이 아직 없으신가요? <Link to="/register">회원가입</Link>
        </p>

        {/* 소셜 로그인 */}
        <div className="social-login">
          <IconButton>
            <Avatar src={NaverIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
          <IconButton>
            <Avatar src={GoogleIcon} sx={{ width: "60px", height: "60px" }} />
          </IconButton>
        </div>
      </div>
    </Style>
  );
};

export default Login;
