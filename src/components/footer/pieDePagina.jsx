import React from "react";
import { Box, Grid, Typography, Link, Divider } from "@mui/material";

const Footer = () => {
  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "20px 30px",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Hitpoly
        </Typography>
      </Box>
    </>
  );
};

export default Footer;
