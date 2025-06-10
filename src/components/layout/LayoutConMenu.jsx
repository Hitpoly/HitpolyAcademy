import React from "react";
import { Box } from "@mui/material";
import NavBar from "../nav/navBar"; 

const LayoutConMenu = ({ children }) => { 
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box>
        <NavBar />
      </Box>

      <Box
        component="main"
        sx={{
          paddingTop: "65px"
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LayoutConMenu;