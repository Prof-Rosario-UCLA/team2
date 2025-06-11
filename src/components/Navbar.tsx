import { Title, Text } from "@mantine/core";
import classes from "../styles/Navbar.module.scss";
import { useEffect, useState } from "react";


export function Navbar() {
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      // Get first name from full name
      const first = userName.split(" ")[0];
      setFirstName(first);
    }
  }, []);


  return (
    <header className={classes.header} role="banner">
      <div className={classes.inner}>
        <Title role="heading" aria-level={1}>ReserveEase</Title>
        {firstName && (
          <Text size="lg" c="white">
            Hello, {firstName}
          </Text>
        )}
      
      </div>
    </header>
  );
}


export default Navbar;
