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
  Avatar,
  IconButton,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Importa useLocation
import Swal from "sweetalert2";
import Ray from "../../UI/Ray";
import { FONT_COLOR_GRAY } from "../../constant/Colors";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { MuiTelInput } from 'mui-tel-input';

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
  numero_celular: Yup.string().required("El número de celular es requerido"),
  estado: Yup.string()
    .oneOf(["activo", "inactivo"], "Estado inválido")
    .required("El estado es requerido"),
  id_tipo_usuario: Yup.number()
    .oneOf([2, 3], "Selecciona un tipo de usuario válido (Profesor o Alumno)")
    .required("El tipo de usuario es requerido"),
  avatarFile: Yup.mixed()
    .required("La foto de perfil es requerida")
    .test(
      "fileType",
      "Formato de imagen no válido (solo JPG, PNG, GIF)",
      (value) => {
        if (!value) return true;
        return (
          value && ["image/jpeg", "image/png", "image/gif"].includes(value.type)
        );
      }
    )
    .test("fileSize", "La imagen es demasiado grande (máx. 5MB)", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    }),
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
  const location = useLocation(); // Importante: Hook para acceder a los parámetros de la URL
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const userTypes = [
    { value: 2, label: "Profesor" },
    { value: 3, label: "Alumno" },
  ];

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const uploadAvatarToCloudinary = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("file", file);

    try {
      setUploadingAvatar(true);
      const response = await axios.post(
        "https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php",
        formDataImg,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.url) {
        return response.data.url;
      } else {
        throw new Error(
          "No se recibió una URL válida desde el backend de Cloudinary."
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "Ocurrió un error al intentar subir la imagen de perfil. Por favor, inténtalo de nuevo.",
      });
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewAvatarUrl(URL.createObjectURL(file));
      setFieldValue("avatarFile", file);
    } else {
      setNewAvatarFile(null);
      setPreviewAvatarUrl(null);
      setFieldValue("avatarFile", null);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });
    setError(null);

    let finalAvatarUrl = "";

    if (newAvatarFile) {
      try {
        finalAvatarUrl = await uploadAvatarToCloudinary(newAvatarFile);
      } catch (uploadError) {
        setLoading(false);
        setSubmitting(false);
        return;
      }
    } else {
      setSnackbar({
        open: true,
        message: "Error: La foto de perfil es requerida.",
        severity: "error",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const registerUrl =
      "https://apiacademy.hitpoly.com/ajax/registerUsuarioController.php";
    const loginUrl =
      "https://apiacademy.hitpoly.com/ajax/usuarioController.php"; // Endpoint de logueo

    const registerData = {
      accion: "registrarUsuario",
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      pass: values.pass,
      numero_celular: values.numero_celular,
      estado: values.estado,
      id_tipo_usuario: values.id_tipo_usuario,
      url_foto_perfil: finalAvatarUrl,
    };

    try {
      const registerResponse = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || "Error desconocido al registrar.");
      }

      const registerResult = await registerResponse.json();
      setSnackbar({
        open: true,
        message: "¡Usuario registrado exitosamente!",
        severity: "success",
      });
      resetForm();
      setNewAvatarFile(null);
      setPreviewAvatarUrl(null);

      // --- Intenta iniciar sesión automáticamente después del registro ---
      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funcion: "login",
          email: values.email,
          pass: values.pass,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginData.status === "success") {
        const userData = loginData.user;
        login(userData); // Autentica al usuario en el contexto
        Swal.fire({
          icon: "success",
          title: "¡Bienvenido al master de hitpoly!",
          text: "Has iniciado sesión correctamente.",
        });

        // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---
        const queryParams = new URLSearchParams(location.search);
        const redirectTo = queryParams.get("redirect"); // Obtiene el valor del parámetro 'redirect'

        if (redirectTo) {
          // Si hay un parámetro redirect, redirige a esa ruta de curso
          // Asegúrate que esta ruta sea correcta para tus cursos
          // Por ejemplo: /curso/117 o /curso/slug-del-curso-117
          navigate(`/curso/${redirectTo}`);
        } else {
          // Si no hay parámetro redirect, redirige a la página principal o dashboard
          navigate("/"); // O '/dashboard' o la ruta por defecto que desees
        }
      } else {
        Swal.fire({
          icon: "warning",
          title:
            "Registro exitoso, pero no se pudo iniciar sesión automáticamente",
          text: "Por favor, inicia sesión manualmente con tus nuevas credenciales.",
        });
        navigate("/login"); // Si no se pudo loguear, lo envía a la página de login
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
      Swal.fire({
        icon: "error",
        title: "Error en el proceso",
        text: `Hubo un problema: ${error.message}`,
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
          numero_celular: "",
          estado: "activo",
          id_tipo_usuario: "",
          avatarFile: null,
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          isSubmitting,
          values,
          handleChange,
          setFieldValue,
        }) => (
          <Form>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Box sx={{ width: "100%", marginBottom: 2 }}>
                <Title>¡Regístrate en nuestra plataforma!</Title>
                <SubTitle>
                  Crea tu cuenta para empezar tu camino hacia el éxito
                </SubTitle>
              </Box>

              {/* --- SECCIÓN DE AVATAR --- */}
              <Box sx={{ position: "relative", mb: 3, textAlign: "center" }}>
                <Avatar
                  src={previewAvatarUrl || "/images/default-avatar.png"}
                  alt="Foto de perfil"
                  sx={{
                    width: 120,
                    height: 120,
                    border: "3px solid #F21D6B",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                    mx: "auto",
                  }}
                />
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#F21D6B",
                    color: "white",
                    "&:hover": { backgroundColor: "#d81a5f" },
                    transform: "translate(25%, 25%)",
                  }}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PhotoCameraIcon />
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e, setFieldValue)}
                  />
                </IconButton>
              </Box>
              {touched.avatarFile && errors.avatarFile && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: -2, mb: 1 }}
                >
                  {errors.avatarFile}
                </Typography>
              )}
              {/* --- FIN SECCIÓN DE AVATAR --- */}

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
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
                <MuiTelInput
                  label="Número de Celular"
                  name="numero_celular"
                  value={values.numero_celular}
                  onChange={(newValue) => setFieldValue("numero_celular", newValue)}
                  error={touched.numero_celular && Boolean(errors.numero_celular)}
                  helperText={touched.numero_celular && errors.numero_celular}
                  required
                  fullWidth
                  size="small"
                  defaultCountry="PE"
                  preferredCountries={['PE', 'CO', 'MX', 'CL', 'AR', 'ES', 'US']}
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
                  error={
                    touched.id_tipo_usuario && Boolean(errors.id_tipo_usuario)
                  }
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
                <input type="hidden" name="estado" value="activo" />

                <Button
                  type="submit"
                  disabled={isSubmitting || loading || uploadingAvatar}
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
                  {loading || uploadingAvatar ? (
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