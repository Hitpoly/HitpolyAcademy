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
      <Typography variant="h2" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#555", mb: 4 }}>
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