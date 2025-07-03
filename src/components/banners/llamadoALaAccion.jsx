import React from "react";
import { Box, Typography, Button } from "@mui/material";

const CenteredCallToAction = ({
  title = "Potencia tu futuro con Hitpoly Academy",
  subtitle = "Accede a programas de calidad y conéctate con expertos de todo el mundo.",
  buttonText = "Explorar Programas",
  buttonLink = "#", 
  backgroundColor = "#f5f5f5", 
  buttonColor = "primary", 
  buttonSx = { backgroundColor: "#F21C63" }, 
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
        py: 20,
        backgroundColor: backgroundColor,
      }}
    >
      <Typography sx={{ mb: 2, fontSize: {xs: "2rem", md: "3rem"} }}>
        {title}
      </Typography>
      <Typography sx={{ color: "#555", mb: 4, fontSize: {xs: "1.2rem", md: "1.3rem"}}}>
        {subtitle}
      </Typography>
      <Button
        sx={buttonSx}
        variant="contained"
        size="large"
        color={buttonColor}
        href={buttonLink}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export default CenteredCallToAction;