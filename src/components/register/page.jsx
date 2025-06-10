import React from "react";
import { Box } from "@mui/material";
import LoginForm from "./components/Form";
import styled from "@emotion/styled";

const ResponsiveImage = styled.img`
  object-fit: fill;
  width: 100%;
  height: 100%;
  display: none;

  @media (min-width: 600px) {
    display: block;
  }
`;

const Register = () => {
  return (
    <Box
      sx={{
        backgroundColor: "rgb(239,239,239)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-around",
            gap: 4,
            paddingBottom: 10,
            marginTop: 4,
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "45%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LoginForm />
          </Box>
          <Box
            sx={{
              width: { xs: "100%", sm: "50%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ResponsiveImage
              src="/images/loginIlustration.svg"
              alt="Login Illustration"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
