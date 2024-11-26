import React from "react";
import styled from "@emotion/styled";
import { useState } from "react";
import { Link } from "react-router-dom";
import { color } from "../utils/theme";
import BackgroundImage from "../assets/images/background.png";
import LockIcon from "@mui/icons-material/Lock";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
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
    font-size: 1.7em;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .checkbox-container {
    display: flex;
    align-self: end;
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
    font-size: 1.2em;
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

const Register = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);

  return (
    <Style>
      <div className="login-form">
        {/* 본/부제목 */}
        <div className="title">
          <h1>여행갈래?</h1>
          <p>세상에서 가장 간단한 계획서</p>
        </div>
        {/* 이메일 */}
        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          placeholder="이메일"
          startAdornment={
            <InputAdornment position="start">
              <EmailIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
          // 중복체크
          endAdornment={
            <InputAdornment position="end">
              <Button
                id="btn-mailcheck"
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  fontWeight: "bold",
                  fontSize: "0.8em"
                }}
              >
                중복체크
              </Button>
            </InputAdornment>
          }
        />

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
        {/* 비밀번호 재입력 */}
        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          type={isPasswordVisible ? "text" : "password"}
          placeholder="비밀번호 재입력"
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
          // 비밀번호 재입력 보임/안보임
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setIsPasswordVisible2(!isPasswordVisible2);
                }}
              >
                {isPasswordVisible2 ? (
                  <VisibilityIcon sx={{ color: "black" }} />
                ) : (
                  <VisibilityOffIcon sx={{ color: "black" }} />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
        {/* 별명 입력 */}
        <OutlinedInput
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "10px",
          }}
          placeholder="별명"
          startAdornment={
            <InputAdornment position="start">
              <LocalOfferIcon
                sx={{
                  color: "black",
                  transform: "scale(1.5)",
                  marginRight: "20px",
                }}
              />
            </InputAdornment>
          }
        />
        {/* 로그인 버튼 & 회원가입 버튼  */}
        <div className="button-container">
          <p className="register">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
          <div className="button-wrapper">
            <Button
              id="btn-login"
              variant="contained"
              sx={{
                borderRadius: "50px",
                fontWeight: "bold",
                fontSize: "1.6em",
                padding: "7px 30px",
              }}
            >
              회원가입
            </Button>
          </div>
        </div>
      </div>
    </Style>
  );
};

export default Register;
