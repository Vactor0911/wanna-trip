import React, { useState } from "react";
import styled from "@emotion/styled";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from "@mui/icons-material/Lock";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityOnIcon from "@mui/icons-material/Visibility";
import EmailIcon from '@mui/icons-material/Email';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from "axios";

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #2b3a52;
  height: 100vh;
  color: #fff;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 50px;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  flex: 1;
  margin-left: 10px;
  font-size: 1rem;
  color: #333;
`;

const Button = styled.button`
  background-color: #3575f1;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #2a5fbd;
  }
`;

const LoginLink = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;

  a {
    color: #3575f1;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #d1d5db;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
`;

const Register = () => {
  
  //비밀번호 보이기/숨기기 시작
  const [isPasswdVisible, setIsPasswdVisible] = useState(false);
  const [isConfirmPasswdVisible, setIsConfirmPasswdVisible] = useState(false);

  const passwdVisibilityHandle = () => {
    setIsPasswdVisible((prev) => !isPasswdVisible);
  };

  const confirmPasswdVisibilityHandle = () => {
    setIsConfirmPasswdVisible((prev) => !isConfirmPasswdVisible);
  }; //비밀번호 보이기/숨기기 끝


  //회원가입 시작
  const [userId, setUserId] = useState(''); // 사용자 아이디
  const [password, setPassword] = useState(''); // 사용자 비밀번호
  const [email, setEmail] = useState(''); // 사용자 이메일
  const [name, setName] = useState(''); // 사용자 이름
  const PORT = 3005; // server/index.js 에 설정한 포트 번호 - 임의로 로컬서버라 이건 알아서 수정하면 됨
  const HOST = 'http://localhost'; // 임의로 로컬서버라 이건 알아서 수정하면 됨


  const Registerbtn = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전송 전 입력값 검증
    if (!email || !password) {
        console.error('이메일 또는 비밀번호가 비어 있을 수 없습니다');
        return;
    }

    console.log('이메일과 비밀번호로 회원가입 요청을 보냅니다:', { email, password });

    try {
        // Axios POST 요청
        const response = await axios.post(`${HOST}:${PORT}/api/register`, {
          userId: userId,
          password: password,
          email: email,
          name: name
          
        });

        // 서버로부터 성공 메시지를 받은 경우
        console.log('Signup successful:', response.data.message);

        // 사용자에게 성공 메시지 보여주기 (UI 반영)
        alert('회원가입이 성공적으로 완료되었습니다!');
        window.location.href = '/login'; // 로그인 페이지로 이동

    } catch (error: any) {
        // 서버로부터 반환된 에러 메시지 확인
        if (error.response) {
            console.error('서버가 오류를 반환했습니다:', error.response.data.message);
            alert(`Error: ${error.response.data.message}`);
        } else {
            console.error('요청을 보내는 중 오류가 발생했습니다:', error.message);
            alert('예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
        }
    }
  };//회원가입 끝

  return (
    <SignupContainer>
      <Title>여행갈래?</Title>
      <Subtitle>세상에서 제일 간단한 계획서</Subtitle>
      <Form>
        <InputContainer> {/* userId 시작  */}
        <PersonIcon style={{ color: "black" }} />
        <Input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        </InputContainer> {/* userId 끝  */}

        <InputContainer> {/* password 시작  */}
        <LockIcon style={{ color: "black" }} />
        <Input
          type={isPasswdVisible ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
          {isPasswdVisible ? (
            <VisibilityOnIcon
              onClick={passwdVisibilityHandle}
              style={{ cursor: "pointer", color: "black"}}
            />
          ) : (
            <VisibilityOffIcon
              onClick={passwdVisibilityHandle}
              style={{ cursor: "pointer", color: "black" }}
            />
          )}
        </InputContainer>  {/* password 끝  */}

        <InputContainer> {/* password 재확인 시작  */}
        <LockIcon style={{ color: "black" }} />
        <Input 
          type={isConfirmPasswdVisible ? "text" : "password"}
          placeholder="비밀번호 확인"
          required
        />
          {isConfirmPasswdVisible ? (
            <VisibilityOnIcon
              onClick={confirmPasswdVisibilityHandle}
              style={{ cursor: "pointer", color: "black"}}
            />
          ) : (
            <VisibilityOffIcon
              onClick={confirmPasswdVisibilityHandle}
              style={{ cursor: "pointer", color: "black" }}
            />
          )}
        </InputContainer> {/* password 재확인 끝  */}

        <InputContainer> {/* email 시작  */}
        <EmailIcon style={{ color: "black" }} />
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        </InputContainer>{/* 이메일 끝  */}

        <InputContainer> {/* name 시작  */}
        <LocalOfferIcon style={{ color: "black" }} />
        <Input 
          type="text"
          placeholder="별명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        </InputContainer> {/* name 끝  */}

        <Button type="submit" onClick={Registerbtn}>회원가입</Button>
      </Form>
      <LoginLink>
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </LoginLink>
    </SignupContainer>
  );
};

export default Register;
