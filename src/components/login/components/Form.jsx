import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import styled from "@emotion/styled";
import { Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import Input from "../../UI/input";
import Ray from "../../UI/Ray";
import { FONT_COLOR_GRAY } from "../../constant/Colors";

const fontFamily = "Inter";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("Campo requerido"),
  password: Yup.string().required("Campo requerido"),
});

const Title = styled.p({
  fontSize: 38,
  fontFamily,
  fontWeight: 600,
  color: "#F21D6B",
  textAlign: "center",
});

const SubTitle = styled.p({
  fontSize: 18,
  fontFamily,
  fontWeight: 400,
  textAlign: "center",
});

const TextGray = styled(Typography)({
  fontSize: 18,
  fontFamily,
  fontWeight: 400,
  color: FONT_COLOR_GRAY,
});

const TextGrayBold = styled(Typography)({
  fontSize: 18,
  fontFamily,
  fontWeight: 700,
  color: FONT_COLOR_GRAY,
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/usuarioController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            funcion: "login",
            email: values.email,
            pass: values.password,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        const userData = data.user;

        login(userData);
        Swal.fire({
          icon: "success",
          title: "¡Bienvenido al master de hitpoly!",
          text: "Has iniciado sesión correctamente",
        });

        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Correo o contraseña incorrectos",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        title: "Error del servidor",
        text: "Hubo un problema al conectar con el servidor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        backgroundColor: "white",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Box sx={{ width: "100%", marginBottom: 2 }}>
                <Title>¡Hola! Nos alegra tenerte de vuelta.</Title>
                <SubTitle>Revolucionamos tu camino hacia el éxito</SubTitle>
                <br />
              </Box>

              <Box sx={{ width: "100%" }}>
                <Input
                  label="Correo electrónico:"
                  type="email"
                  name="email"
                  error={errors.email}
                  touched={touched.email}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  error={errors.password}
                  touched={touched.password}
                />
                <br />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    width: "100%",
                    backgroundColor: "#F21D6B",
                    color: "#fff",
                    fontFamily,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#d81a5f",
                    },
                  }}
                >
                  {isSubmitting ? "Cargando..." : "Log In"}
                </Button>

                <br />
                <br />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "baseline",
                  }}
                >
                  <TextGray sx={{ marginRight: "20px" }}>
                    ¿No tienes cuenta?
                  </TextGray>

                  <Link to="/register" style={{ textDecoration: "none" }}>
                    <TextGrayBold sx={{ marginLeft: "100px" }}>
                      Crear cuenta
                    </TextGrayBold>
                  </Link>
                </Box>

                <br />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Box sx={{ flexBasis: "auto", flexGrow: 1 }}>
                    <Ray />
                  </Box>
                  <Box
                    sx={{ flexBasis: "auto", flexGrow: 8, textAlign: "center" }}
                  >
                    <TextGray></TextGray>
                  </Box>
                  <Box sx={{ flexBasis: "auto", flexGrow: 1 }}>
                    <Ray />
                  </Box>
                </Box>

                <br />

                <Box
                  display="flex"
                  gap={2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Box sx={{ width: "100%", textAlign: "center" }}>
                    <TextGray>info@hitpoly.com</TextGray>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default LoginForm;
