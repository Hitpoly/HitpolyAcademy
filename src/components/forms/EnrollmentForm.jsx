import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_USER_TYPE_ID = 3;
const DEFAULT_COURSE_ID = "70"; // Mantener como string para consistencia inicial

// --- Función para extraer el ID numérico de la URL ---
const extractCourseIdFromSlug = (slug) => {
  if (!slug) return null; // Retorna null si no hay slug

  // Busca el último segmento numérico en la cadena (ej: -119)
  const match = slug.match(/-(\d+)$/);
  if (match && match[1]) {
    return match[1]; // Retorna solo el número como string
  }
  return null; // Retorna null si no se encuentra un ID numérico
};

// Esquema de validación para el registro inicial
const EnrollmentSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es requerido"),
  apellido: Yup.string().required("El apellido es requerido"),
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("El correo es requerido"),
  pass: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  telefono: Yup.string()
    .matches(/^[0-9]+$/, "El teléfono solo debe contener números")
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .required("El número de teléfono es requerido"),
});

// Esquema de validación para los datos de interés (si el usuario ya está registrado)
const InterestSchema = Yup.object().shape({
  objetivo_curso: Yup.string().required("El objetivo del curso es requerido"),
  industria_actual: Yup.string().required("La industria actual es requerida"),
  horas_dedicacion_semanal: Yup.number()
    .required("Las horas de dedicación son requeridas")
    .min(1, "Debe dedicar al menos 1 hora semanal")
    .typeError("Debe ser un número"),
  interes_adicional: Yup.string().notRequired(),
});

const EnrollmentForm = () => {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const { id: urlSlugFromParams } = useParams(); // Cambiado a urlSlugFromParams

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
  }, [isAuthenticated]);

const parseApiResponse = async (response) => {
  try {
    const json = await response.json();
    return json;
  } catch (error) {
    const text = await response.text();

    if (text.trim() === "") {
      throw new Error("La API devolvió una respuesta vacía.");
    }
    throw new Error(
      `La API devolvió un formato inesperado o JSON inválido. Contenido: "${text.substring(
        0,
        200
      )}..."`
    );
  }
};


const enrollUserInCourse = async (userId, courseId) => {
  // Asegurarse de que courseId es un número válido antes de enviar
  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    throw new Error("El ID del curso para inscripción no es un número válido.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const dataToEnrollCourse = {
    accion: "inscripciones",
    usuario_id: userId,
    curso_id: parsedCourseId, // Usar el ID parseado
    fecha_inscripcion: today,
    progreso: 0,
    completado: 0,
    fecha_completado: null,
  };

  
  const enrollResponse = await fetch(
    "https://apiacademy.hitpoly.com/ajax/cargarInscripcionController.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToEnrollCourse),
    }
  );

  if (!enrollResponse.ok) {
    const errorData = await parseApiResponse(enrollResponse);
    const errorMessage =
      errorData.message ||
      `Error ${enrollResponse.status}: Fallo al inscribir al usuario en el curso.`;
    throw new Error(errorMessage);
  }

  const enrollResultData = await parseApiResponse(enrollResponse);
  if (
    enrollResultData.status === "success" ||
    enrollResultData.status === "warning"
  ) {
    // Si es warning, podemos mostrar una alerta diferente si quieres, o simplemente proceder.
    if (enrollResultData.status === "warning") {
      }
    return enrollResultData; // Retornamos el resultado para que el flujo continúe
  } else {
    // Cualquier otro status que no sea success o warning es un error real
    throw new Error(
      enrollResultData.message || "La inscripción al curso no fue exitosa."
    );
  }
};

  // Manejador para el registro de nuevos usuarios
  const handleRegisterAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    const dataToRegisterUser = {
      accion: "registrarUsuario",
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      pass: values.pass,
      estado: "activo",
      id_tipo_usuario: DEFAULT_USER_TYPE_ID,
      telefono: values.telefono,
    };

    
    try {
      const registerResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/registerUsuarioController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToRegisterUser),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await parseApiResponse(registerResponse);
        const errorMessage = errorData.message || `Error ${registerResponse.status}: Fallo al registrar el usuario.`;
        throw new Error(errorMessage);
      }

      const registerResult = await parseApiResponse(registerResponse);
      
      if (registerResult.status !== "success") {
        throw new Error(
          registerResult.message || "Fallo en el registro del usuario."
        );
      }

      // --- LOGIN AUTOMÁTICO DESPUÉS DEL REGISTRO EXITOSO ---
      const loginData = {
        funcion: "login",
        email: values.email,
        pass: values.pass,
      };

      const loginResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/usuarioController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      if (!loginResponse.ok) {
        const errorData = await parseApiResponse(loginResponse);
        const errorMessage = errorData.message || `Error ${loginResponse.status}: Fallo en el inicio de sesión automático.`;
        throw new Error(errorMessage);
      }

      const loginResult = await parseApiResponse(loginResponse);
      
      if (loginResult.status === "success") {
        const userData = loginResult.user;
        login(userData); // Actualizar el contexto de autenticación

        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Ahora, por favor, completa algunos datos adicionales para tu inscripción al curso.",
        }).then(() => {
          // El componente se re-renderizará con el formulario de intereses debido a `isAuthenticated`
          // No es necesario navegar aquí, el estado `isAuthenticated` lo controla
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de inicio de sesión automático",
          text:
            loginResult.message ||
            "No se pudo iniciar sesión automáticamente después del registro. Inténtelo manualmente.",
        });
        setSnackbar({
          open: true,
          message: loginResult.message || "Error al iniciar sesión automáticamente.",
          severity: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en el proceso",
        text: `Hubo un problema: ${error.message}`,
      });
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Manejador para actualizar intereses y luego inscribir al usuario (si ya está registrado)
  const handleUpdateInterestAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    // --- CAMBIO CLAVE AQUÍ: Extraer el ID numérico del slug ---
    const extractedCourseId = extractCourseIdFromSlug(urlSlugFromParams);
    const courseToEnrollId = extractedCourseId || DEFAULT_COURSE_ID; // Usar el ID extraído o el default

    // Convertir a número aquí para el objeto a enviar, y también para el enrollment
    const parsedCourseToEnrollId = parseInt(courseToEnrollId, 10);
    if (isNaN(parsedCourseToEnrollId)) {
        Swal.fire({
            icon: "error",
            title: "Error de ID de Curso",
            text: "No se pudo determinar un ID de curso válido para la inscripción.",
        });
        setLoading(false);
        setSubmitting(false);
        return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 19).replace("T", " "); // Formato "YYYY-MM-DD HH:MM:SS"

    const dataToRegisterInterest = {
      accion: "registrarIntereses",
      usuario_id: user.id, // ID del usuario autenticado
      curso_id: parsedCourseToEnrollId, // ¡Usar el ID parseado aquí!
      objetivo_curso: values.objetivo_curso,
      industria_actual: values.industria_actual,
      horas_dedicacion_semanal: parseInt(values.horas_dedicacion_semanal, 10),
      interes_adicional: values.interes_adicional || "",
      fecha_registro_interes: formattedDate,
    };

    
    try {
      // 1. Enviar datos de interés
      const interestResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/cargarDatosUserController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToRegisterInterest),
        }
      );

      if (!interestResponse.ok) {
        const errorData = await parseApiResponse(interestResponse); // Usa la función mejorada
        const errorMessage = errorData.message || `Error ${interestResponse.status}: Fallo al registrar los datos de interés.`;
        throw new Error(errorMessage);
      }

      const interestResult = await parseApiResponse(interestResponse);
      
      if (interestResult.status !== "success") {
        throw new Error(
          interestResult.message || "Fallo al registrar los datos de interés."
        );
      }

      // 2. Inscribir al usuario en el curso
      await enrollUserInCourse(user.id, parsedCourseToEnrollId); // Asegúrate de pasar el ID numérico

      Swal.fire({
        icon: "success",
        title: "¡Información y curso asignados exitosamente!",
        text: "Tus datos han sido guardados y el curso ha sido asignado. ¡Bienvenido!",
      }).then(() => {
        navigate(`/master-full/${parsedCourseToEnrollId}`); // Redirigir a master-full con el ID numérico
      });

      resetForm();
      setSnackbar({
        open: true,
        message: "¡Información guardada y curso asignado!",
        severity: "success",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en el proceso",
        text: `Hubo un problema: ${error.message}`,
      });
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Si el usuario ya está autenticado, muestra el formulario de intereses
  if (isAuthenticated) {
    const courseIdForTitle = extractCourseIdFromSlug(urlSlugFromParams) || DEFAULT_COURSE_ID; // Usar el ID numérico para el título

    return (
      <Box
        sx={{
          padding: { xs: 3, md: 4 },
          width: "100%",
          margin: "auto",
          maxWidth: "500px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Formik
          initialValues={{
            objetivo_curso: "",
            industria_actual: "",
            horas_dedicacion_semanal: "",
            interes_adicional: "",
          }}
          validationSchema={InterestSchema}
          onSubmit={handleUpdateInterestAndEnroll}
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
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 1, color: "text.primary", textAlign: "center" }}
                  >
                    ¡Completa tus datos para empezar el curso {courseIdForTitle}!
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}
                  >
                    Ayúdanos a personalizar tu experiencia.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="¿Cuál es tu objetivo principal con este curso?"
                    name="objetivo_curso"
                    variant="outlined"
                    margin="normal"
                    size="small"
                    value={values.objetivo_curso}
                    onChange={handleChange}
                    error={touched.objetivo_curso && Boolean(errors.objetivo_curso)}
                    helperText={touched.objetivo_curso && errors.objetivo_curso}
                    required
                    sx={{
                      "& .MuiInputBase-input": { color: "text.primary" },
                      "& .MuiInputLabel-root": { color: "text.secondary" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.87)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#007bff",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="¿En qué industria trabajas actualmente?"
                    name="industria_actual"
                    variant="outlined"
                    margin="normal"
                    size="small"
                    value={values.industria_actual}
                    onChange={handleChange}
                    error={touched.industria_actual && Boolean(errors.industria_actual)}
                    helperText={touched.industria_actual && errors.industria_actual}
                    required
                    sx={{
                      "& .MuiInputBase-input": { color: "text.primary" },
                      "& .MuiInputLabel-root": { color: "text.secondary" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.87)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#007bff",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="¿Cuántas horas a la semana puedes dedicar al curso?"
                    name="horas_dedicacion_semanal"
                    variant="outlined"
                    margin="normal"
                    type="number"
                    size="small"
                    value={values.horas_dedicacion_semanal}
                    onChange={handleChange}
                    error={
                      touched.horas_dedicacion_semanal &&
                      Boolean(errors.horas_dedicacion_semanal)
                    }
                    helperText={
                      touched.horas_dedicacion_semanal &&
                      errors.horas_dedicacion_semanal
                    }
                    required
                    sx={{
                      "& .MuiInputBase-input": { color: "text.primary" },
                      "& .MuiInputLabel-root": { color: "text.secondary" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.87)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#007bff",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Intereses adicionales (opcional)"
                    name="interes_adicional"
                    variant="outlined"
                    margin="normal"
                    size="small"
                    value={values.interes_adicional}
                    onChange={handleChange}
                    error={touched.interes_adicional && Boolean(errors.interes_adicional)}
                    helperText={touched.interes_adicional && errors.interes_adicional}
                    sx={{
                      "& .MuiInputBase-input": { color: "text.primary" },
                      "& .MuiInputLabel-root": { color: "text.secondary" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.87)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#007bff",
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting || loading}
                    sx={{
                      backgroundColor: "#F21D6B",
                      "&:hover": {
                        backgroundColor: "#d81a5f",
                      },
                      mt: 2,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Guardar Información e Inscribirme"
                    )}
                  </Button>
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
  }

  // Si el usuario NO está autenticado, muestra el formulario de registro
  return (
    <Box
      sx={{
        padding: { xs: 3, md: 4 },
        width: "100%",
        margin: "auto",
        maxWidth: "500px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        backgroundColor: "white",
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
          telefono: "",
        }}
        validationSchema={EnrollmentSchema}
        onSubmit={handleRegisterAndEnroll}
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
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 1, color: "text.primary", textAlign: "center" }}
                >
                  ¡Regístrate para acceder al programa!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}
                >
                  Crea tu cuenta para empezar tu camino hacia el éxito.
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  variant="outlined"
                  margin="normal"
                  size="small"
                  value={values.nombre}
                  onChange={handleChange}
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  required
                  sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007bff",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Apellido"
                  name="apellido"
                  variant="outlined"
                  margin="normal"
                  size="small"
                  value={values.apellido}
                  onChange={handleChange}
                  error={touched.apellido && Boolean(errors.apellido)}
                  helperText={touched.apellido && errors.apellido}
                  required
                  sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007bff",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Correo electrónico del trabajo"
                  name="email"
                  variant="outlined"
                  margin="normal"
                  type="email"
                  size="small"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  required
                  sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007bff",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="pass"
                  variant="outlined"
                  margin="normal"
                  type="password"
                  size="small"
                  value={values.pass}
                  onChange={handleChange}
                  error={touched.pass && Boolean(errors.pass)}
                  helperText={touched.pass && errors.pass}
                  required
                  sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007bff",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Número de teléfono"
                  name="telefono"
                  variant="outlined"
                  margin="normal"
                  type="tel"
                  size="small"
                  value={values.telefono}
                  onChange={handleChange}
                  error={touched.telefono && Boolean(errors.telefono)}
                  helperText={touched.telefono && errors.telefono}
                  required
                  sx={{
                    "& .MuiInputBase-input": { color: "text.primary" },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#007bff",
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting || loading}
                  sx={{
                    backgroundColor: "#F21D6B",
                    "&:hover": {
                      backgroundColor: "#d81a5f",
                    },
                    mt: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Registrar Usuario"
                  )}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: "block", textAlign: "center" }}
                >
                  Al enviar este formulario, aceptas nuestros términos y
                  condiciones.
                </Typography>
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

export default EnrollmentForm;