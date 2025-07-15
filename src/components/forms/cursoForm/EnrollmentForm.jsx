import React, { useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { useEnrollmentLogic } from "./logic/useEnrollmentLogic"; // Importa el nuevo hook

// Esquemas de validación (pueden quedarse aquí o moverse a un archivo de 'schemas')
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
  const { id: urlSlugFromParams } = useParams();
  const {
    loading, // Estado de carga para envío de formularios (registro/interés)
    snackbar,
    handleCloseSnackbar,
    handleRegisterAndEnroll,
    handleUpdateInterestAndEnroll,
    isAuthenticated,
    navigate,
    extractCourseIdFromSlug,
    // --- ¡Nuevas propiedades del hook! ---
    isEnrolled,         // Si el usuario ya está inscrito en este curso (por título)
    checkingEnrollment, // Si se está verificando el estado de inscripción (carga inicial)
    courseDetails,      // Detalles del curso actual (incluye el título)
  } = useEnrollmentLogic(urlSlugFromParams);

  const courseId = extractCourseIdFromSlug(urlSlugFromParams); // Obtener el ID del curso para la redirección

  // No necesitamos un useEffect aquí para isAuthenticated, ya que el hook lo maneja internamente.
  // Pero lo dejo comentado por si lo usabas para otra cosa.
  /*
  useEffect(() => {
    // Puedes mantener este useEffect si necesitas alguna acción específica al cambiar el estado de autenticación.
    // En este caso, el hook ya maneja la lógica de navegación y redirección.
  }, [isAuthenticated]);
  */

  // --- Lógica para mostrar el estado de carga inicial (verificando inscripción) ---
  if (checkingEnrollment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Verificando tu estado de inscripción...
        </Typography>
      </Box>
    );
  }

  // --- Lógica para el botón de acceso rápido si el usuario ya está inscrito ---
  if (isAuthenticated && isEnrolled && courseDetails) {
    return (
      <Box
        sx={{
          padding: { xs: 3, md: 4 },
          width: "100%",
          margin: "auto",
          maxWidth: "500px",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "primary.main" }}>
          ¡Ya estás inscrito en "{courseDetails.title}"! 🎉
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Continúa tu aprendizaje o explora el contenido del curso.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#F21D6B",
            "&:hover": {
              backgroundColor: "#d81a5f",
            },
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
          }}
          onClick={() => navigate(`/master-full/${courseId}`)} // Redirige al curso
        >
          Acceder al Curso
        </Button>
      </Box>
    );
  }

  // --- Si no se pudo obtener el ID del curso o los detalles ---
  if (!courseId || !courseDetails) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          No se pudo cargar la información del curso. Por favor, asegúrate de acceder a través de un enlace de curso válido.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Ir a la página principal
        </Button>
      </Box>
    );
  }

  // --- Si el usuario está autenticado PERO NO INSCRITO (mostrar formulario de intereses) ---
  if (isAuthenticated && !isEnrolled) {
    return (
      <Box
        sx={{
          padding: { xs: 3, md: 4 },
          width: "100%",
          margin: "auto",
          maxWidth: "500px",
          borderRadius: "8px",
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
                    ¡Completa tus datos para empezar el curso "{courseDetails.title}"!
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
                    error={
                      touched.objetivo_curso && Boolean(errors.objetivo_curso)
                    }
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
                    error={
                      touched.industria_actual && Boolean(errors.industria_actual)
                    }
                    helperText={
                      touched.industria_actual && errors.industria_actual
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
                    error={
                      touched.interes_adicional &&
                      Boolean(errors.interes_adicional)
                    }
                    helperText={
                      touched.interes_adicional && errors.interes_adicional
                    }
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

  // --- Si el usuario NO está autenticado (mostrar formulario de registro) ---
  return (
    <Box
      sx={{
        padding: { xs: 3, md: 4 },
        width: "100%",
        margin: "auto",
        maxWidth: "500px",
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
                  ¡Regístrate para acceder al programa {courseDetails?.title}!
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