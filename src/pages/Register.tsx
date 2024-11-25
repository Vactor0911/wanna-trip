import React from "react";
import styled from "@emotion/styled";

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #2b3a52;
  height: 100vh;
  color: white;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
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
  background-color: #f7f7f7;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #3575f1;
  color: white;
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

const Register = () => {

    const Registerbtn = () => {
        alert("눈눈!");
    }
  return (
    <SignupContainer>
      <Title>여행갈래?</Title>
      <Subtitle>세상에서 제일 간단한 계획서</Subtitle>
      <Form>
        <Input type="text" placeholder="아이디" />
        <Input type="password" placeholder="비밀번호" />
        <Input type="password" placeholder="비밀번호 확인" />
        <Input type="email" placeholder="이메일" />
        <Input type="text" placeholder="별명" />
        <Button onClick={Registerbtn} type="submit">회원가입</Button>
      </Form>
      <LoginLink>
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </LoginLink>
    </SignupContainer>
  );
};

export default Register;
