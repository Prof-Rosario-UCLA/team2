// components/LoginPage.tsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import styles from "../styles/Login.module.scss";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
        console.log('login successful')
        // const res = await axios.post("http://localhost:4000/auth/google", {
        //     token: credentialResponse.credential,
        // });

      localStorage.setItem("token", "test"); // save auth token
      onLoginSuccess(); // tell App we're now logged in
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className={styles["login-page"]}>
      <h2>Please Sign in with Google</h2>
      <div className={styles["google-login-button"]}>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.error("Login Failed")}
        />
      </div>
    </div>
  );
};

export default LoginPage;
