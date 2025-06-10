import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import styled from "@emotion/styled";
import {
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Ray from "../../UI/Ray";
import { FONT_COLOR_GRAY } from "../../constant/Colors";

const fontFamily = "Inter";

const RegisterSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es requerido"),
  apellido: Yup.string().required("El apellido es requerido"),
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("El correo es requerido"),
  pass: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  estado: Yup.string()
    .oneOf(["activo", "inactivo"], "Estado inválido")
    .required("El estado es requerido"),
  id_tipo_usuario: Yup.number()
    .oneOf([1, 2, 3], "Selecciona un tipo de usuario válido")
    .required("El tipo de usuario es requerido"),
});

const Title = styled.p({
  fontSize: 32, 
  fontFamily,
  fontWeight: 600,
  color: "#F21D6B",
  textAlign: "center",
  marginBottom: "8px", 
});

const SubTitle = styled.p({
  fontSize: 16, 
  fontFamily,
  fontWeight: 400,
  textAlign: "center",
  marginBottom: "16px", 
});

const TextGray = styled(Typography)({
  fontSize: 16, 
  fontFamily,
  fontWeight: 400,
  color: FONT_COLOR_GRAY,
});

const TextGrayBold = styled(Typography)({
  fontSize: 16, 
  fontFamily,
  fontWeight: 700,
  color: FONT_COLOR_GRAY,
});

const RegisterUserForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const userTypes = [
    { value: 1, label: "Administrador" },
    { value: 2, label: "Profesor" },
    { value: 3, label: "Alumno" },
  ];

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    const url = "https://apiacademy.hitpoly.com/ajax/registerUsuarioController.php";
    const dataToSend = {
      accion: "registrarUsuario",
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      pass: values.pass,
      estado: values.estado,
      id_tipo_usuario: values.id_tipo_usuario,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error desconocido al registrar.");
      }

      const result = await response.json();
      setSnackbar({
        open: true,
        message: "¡Usuario registrado exitosamente!",
        severity: "success",
      });
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
      Swal.fire({
        icon: "error",
        title: "Error de registro",
        text: `Hubo un problema al registrar el usuario: ${error.message}`,
      });
    } finally {
      setLoading(false);
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Formik
        initialValues={{
          nombre: "",
          apellido: "",
          email: "",
          pass: "",
          estado: "activo",
          id_tipo_usuario: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, values, handleChange }) => (
          <Form>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Box sx={{ width: "100%", marginBottom: 2 }}>
                <Title>¡Regístrate en nuestra plataforma!</Title>
                <SubTitle>Crea tu cuenta para empezar tu camino hacia el éxito</SubTitle>
              </Box>

              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Apellido"
                  name="apellido"
                  value={values.apellido}
                  onChange={handleChange}
                  error={touched.apellido && Boolean(errors.apellido)}
                  helperText={touched.apellido && errors.apellido}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Contraseña"
                  name="pass"
                  type="password"
                  value={values.pass}
                  onChange={handleChange}
                  error={touched.pass && Boolean(errors.pass)}
                  helperText={touched.pass && errors.pass}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  select
                  label="Tipo de Usuario"
                  name="id_tipo_usuario"
                  value={values.id_tipo_usuario}
                  onChange={handleChange}
                  error={touched.id_tipo_usuario && Boolean(errors.id_tipo_usuario)}
                  helperText={touched.id_tipo_usuario && errors.id_tipo_usuario}
                  required
                  fullWidth
                  size="small"
                >
                  {userTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  sx={{
                    width: "100%",
                    backgroundColor: "#F21D6B",
                    color: "#fff",
                    fontFamily,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#d81a5f",
                    },
                    mt: 1,
                    py: 1,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Registrar Usuario"
                  )}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "baseline",
                    mt: 1,
                  }}
                >
                  <TextGray sx={{ marginRight: "10px" }}>
                    ¿Ya tienes cuenta?
                  </TextGray>

                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <TextGrayBold sx={{ marginLeft: "10px" }}>
                      Iniciar sesión
                    </TextGrayBold>
                  </Link>
                </Box>

                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: "100%", mt: 1 }}
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

                <Box
                  display="flex"
                  gap={1}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: "100%", mt: 1 }}
                >
                  <Box sx={{ width: "100%", textAlign: "center" }}>
                    <TextGray>info@hitpoly.com</TextGray>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default RegisterUserForm;