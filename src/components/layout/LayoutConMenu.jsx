import React from "react";
import { Box } from "@mui/material";
import NavBar from "../nav/navBar";
import { Outlet } from "react-router-dom";

const LayoutConMenu = ({ title }) => { 
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minHeight: "100vh", 
      }}
    >
      <Box>
        <NavBar />
      </Box>

      <Box
        component="main"
        sx={{
          paddingTop: "65px", 
          flexGrow: 1, 
        }}
      >
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default LayoutConMenu;
