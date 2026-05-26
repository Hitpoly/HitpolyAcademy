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
import { useEnrollmentLogic } from "./logic/useEnrollmentLogic"; // Importa el hook

// Esquemas de validación (pueden quedarse aquí o moverse a un archivo de 'schemas')
// NOTA: El EnrollmentSchema ya no se usará directamente en este componente, pero lo dejo por si lo necesitas en /register.
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

const EnrollmentForm = ({ onSuccess, isInCart }) => {
  const { id: urlSlugFromParams } = useParams();
  const {
    loading, // Estado de carga para envío de formularios (solo interés ahora)
    snackbar,
    handleCloseSnackbar,
    // handleRegisterAndEnroll, // Este ya no se usa aquí
    handleUpdateInterestAndEnroll,
    isAuthenticated,
    navigate,
    extractCourseIdFromSlug,
    isEnrolled,
    checkingEnrollment,
    courseDetails,
  } = useEnrollmentLogic(urlSlugFromParams);

  const courseId = extractCourseIdFromSlug(urlSlugFromParams); // Obtener el ID del curso para la redirección

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

  // --- Si no se pudo obtener el ID del curso o los detalles (después de la carga inicial) ---
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

  // --- Lógica para el botón de acceso rápido si el usuario ya está inscrito ---
  if (isAuthenticated && isEnrolled) { // courseDetails ya está verificado arriba
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
            mb: 2, // Espacio para el siguiente botón
            width: "100%"
          }}
          onClick={() => navigate(`/master-full/${courseId}`)} // Redirige al curso
        >
          🚀 Aprovechar Prueba
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#F21D6B",
            color: "#F21D6B",
            "&:hover": {
              borderColor: "#d81a5f",
              backgroundColor: "rgba(242, 29, 107, 0.04)",
            },
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            width: "100%"
          }}
          onClick={() => {
            if (isInCart) {
              // Si ya está en el carrito, abrir el carrito
              if (window.self !== window.top) {
                window.top.postMessage({ type: 'OPEN_CART' }, '*');
              } else {
                window.location.href = "https://hitpoly.com/?cart=open";
              }
            } else {
              // Si no, mostrar la oferta
              onSuccess && onSuccess();
            }
          }} 
        >
          {isInCart ? "🛒 Ir al Carrito" : "🔥 Ver Oferta"}
        </Button>
      </Box>
    );
  }

  // --- Si el usuario NO está autenticado (mostrar mensaje para registrarse) ---
  if (!isAuthenticated) {
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
          Regístrate para inscribirte en "{courseDetails.title}"
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Necesitas una cuenta para acceder a este curso.
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
          onClick={() => navigate(`/register?redirect=${urlSlugFromParams}`)} // Redirige a /register y pasa el slug del curso
        >
          Ir a Registrarme
        </Button>
      </Box>
    );
  }

  // --- Si el usuario está autenticado PERO NO INSCRITO (mostrar formulario de intereses) ---
  // Esta es la única sección que ahora usará un formulario en este componente
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
        onSubmit={async (values, formikHelpers) => {
          await handleUpdateInterestAndEnroll(values, formikHelpers);
          if (onSuccess) onSuccess();
        }}
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
};

export default EnrollmentForm;