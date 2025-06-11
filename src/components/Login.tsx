import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../styles/Login.module.scss";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      // Decode the JWT token to get user info
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userInfo = JSON.parse(jsonPayload);
      console.log('User info:', userInfo);
      
      // Store user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userInfo.name);
      localStorage.setItem("userEmail", userInfo.email);
      
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
