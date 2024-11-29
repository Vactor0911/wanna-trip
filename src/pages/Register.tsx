import React, { useState } from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { color } from "../utils/theme";
import BackgroundImage from "../assets/images/background.png";
import LockIcon from "@mui/icons-material/Lock";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from '@mui/icons-material/Email';
import {
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; //네이게이트를 사용하기 위해 추가
import axios from "axios";

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
    width: 35%;
    height: 100vh;
    top: 0;
    left: 9%;
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
      width: 88%;
      left: 6%;
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
  const navigate = useNavigate(); //네이게이트를 사용하기 위해 추가
  
  //비밀번호 보이기/숨기기 시작
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordCheckVisible, setIsPasswordCheckVisible] = useState(false);
 //비밀번호 보이기/숨기기 끝


  //회원가입 시작
  const [email, setEmail] = useState(''); // 사용자 이메일
  const [password, setPassword] = useState(''); // 사용자 비밀번호
  const [password_comparison, setPassword_comparison] = useState(''); // 사용자 비밀번호 재확인
  const [name, setName] = useState(''); // 사용자 이름

  const PORT = 3005; // server/index.js 에 설정한 포트 번호 - 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨


  const Registerbtn = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전송 전 입력값 검증
    if (!email || !password || !password_comparison) {
        console.error('이메일 또는 비밀번호가 비어있으면 안됩니다.');
        alert("이메일 또는 비밀번호가 비어있으면 안됩니다.");
        return;
    }

    if (!name) {
      console.error('닉네임을 입력해주세요.');
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (password !== password_comparison) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log('이메일과 비밀번호로 회원가입 요청을 보냅니다:', { email, password });

    // 서버로 회원가입 요청 전송
    axios
    .post(`${HOST}:${PORT}/api/register`, {
      email: email,
      password: password,
      name: name,
    })
    .then((response) => {
      // 서버로부터 성공 메시지를 받은 경우
      console.log("회원가입 성공:", response.data.message);

      // 사용자에게 성공 메시지 보여주기 (UI 반영)
      alert("회원가입이 성공적으로 완료되었습니다!");
      navigate("/login"); // 회원가입 성공 시 로그인 페이지로 이동
    })
    .catch((error) => {
      // 서버로부터 반환된 에러 메시지 확인
      if (error.response) {
        console.error("서버가 오류를 반환했습니다:", error.response.data.message);
        alert(`Error: ${error.response.data.message}`);
      } else {
        console.error("요청을 보내는 중 오류가 발생했습니다:", error.message);
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }
    });

  };  //회원가입 끝

  //이메일 중복 검사 시작
  const handleCheckEmail = async () => {
    if (!email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    axios
    .post(`${HOST}:${PORT}/api/emailCheck`, {
      email: email, // 사용자가 입력한 이메일
    })
    .then((response) => {
      const { success, message } = response.data;

      if (success) {
        alert(message); // "사용 가능한 이메일입니다."
      } else {
        alert(message); // "이미 사용 중인 이메일입니다."
      }
    })
    .catch((error) => {
      console.error("이메일 중복 검사 오류:", error);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });
  };  //이메일 중복 검사 끝


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
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required

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
                onClick={handleCheckEmail}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required

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
          type={isPasswordCheckVisible ? "text" : "password"}
          placeholder="비밀번호 재입력"
          value={password_comparison}
          onChange={(e) => setPassword_comparison(e.target.value)}
          required

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
                  setIsPasswordCheckVisible(!isPasswordCheckVisible);
                }}
              >
                {isPasswordCheckVisible ? (
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
          type="text"
          placeholder="별명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required

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
              onClick={Registerbtn}
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
