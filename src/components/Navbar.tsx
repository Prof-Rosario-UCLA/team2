// import {Burger, Group} from "@mantine/core";
import { Title } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
import classes from "../styles/Navbar.module.scss";

// const links = [
//   { link: "/about", label: "Floor Plan" },
//   // {
//   //   link: "#1",
//   //   label: "Learn",
//   //   links: [
//   //     { link: "/docs", label: "Documentation" },
//   //     { link: "/resources", label: "Resources" },
//   //     { link: "/community", label: "Community" },
//   //     { link: "/blog", label: "Blog" },
//   //   ],
//   // },
//   { link: "/about", label: "Reservations" },
//   { link: "/pricing", label: "Reports" },
//   // {
//   //   link: "#2",
//   //   label: "Support",
//   //   links: [
//   //     { link: "/faq", label: "FAQ" },
//   //     { link: "/demo", label: "Book a demo" },
//   //     { link: "/forums", label: "Forums" },
//   //   ],
//   // },
// ];

export function Navbar() {
  //const [opened, { toggle }] = useDisclosure(false);

  // const items = links.map((link) => {
  //   // const menuItems = link.map((item) => (
  //   //   <Menu.Item key={item.link}>{item.label}</Menu.Item>
  //   // ));

  //   // if (menuItems) {
  //   //   return (
  //   //     <Menu
  //   //       key={link.label}
  //   //       trigger="hover"
  //   //       transitionProps={{ exitDuration: 0 }}
  //   //       withinPortal
  //   //     >
  //   //       <Menu.Target>
  //   //         <a
  //   //           href={link.link}
  //   //           className={classes.link}
  //   //           onClick={(event) => event.preventDefault()}
  //   //         >
  //   //           <Center>
  //   //             <span className={classes.linkLabel}>{link.label}</span>
  //   //             <IconChevronDown size={14} stroke={1.5} />
  //   //           </Center>
  //   //         </a>
  //   //       </Menu.Target>
  //   //       <Menu.Dropdown>{menuItems}</Menu.Dropdown>
  //   //     </Menu>
  //   //   );
  //   // }

  //   return (
  //     <a
  //       key={link.label}
  //       href={link.link}
  //       className={classes.link}
  //       onClick={(event) => event.preventDefault()}
  //     >
  //       {link.label}
  //     </a>
  //   );
  // });

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Title>ReserveEase</Title>
        {/* <Group gap={5} visibleFrom="sm" className={classes.itemGroup}>
          {items}
        </Group>
        <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" /> */}
      </div>
    </header>
  );
}

// import { Title } from "@mantine/core";
// import React, { useState } from "react";
// import "../styles/Navbar.scss";

// function Navbar() {
//   return (
//     <nav
//       style={{
//         width: "100%",
//         height: "70px",
//         backgroundColor: "green",
//       }}
//     >
//       <div className="navbar-container">
//         <Title style={{ fontSize: "2rem" }}>ReserveEase</Title>
//         <div className="navbar-right-options">
//           <p>Floor Plan</p>
//           <p>Reservations</p>
//           <p>Reports</p>
//         </div>
//       </div>
//     </nav>
//   );
// }

export default Navbar;
