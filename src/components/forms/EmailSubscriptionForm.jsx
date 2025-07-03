import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

// Helper para el Alert dentro de Snackbar
const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EmailSubscriptionForm = ({ idCursoDestacado }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para el Snackbar (solo para errores o éxitos que no redirigen)
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  console.log("Datos de usuario disponibles en AuthContext:", user);
  console.log("¿Usuario autenticado?:", isAuthenticated);
  console.log("ID del curso destacado recibido:", idCursoDestacado);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setOpenSnackbar(false); // Siempre cierra cualquier Snackbar anterior al inicio

    if (!emailInput) {
      setSnackbarMessage("Por favor, ingresa tu correo electrónico.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true); // Abre el Snackbar para esta advertencia
      setLoading(false);
      return;
    }

    const correosToSend = [];
    const celularesToSend = [];

    let primaryEmailForPayload;
    if (isAuthenticated && user?.email) {
      primaryEmailForPayload = user.email;
    } else {
      primaryEmailForPayload = emailInput;
    }

    if (emailInput) {
      correosToSend.push({ id: 1, tipo: "formulario", email: emailInput });
    }

    if (isAuthenticated && user?.email && user.email !== emailInput) {
      correosToSend.push({ id: 2, tipo: "usuario_autenticado", email: user.email });
    }

    if (phoneInput) {
      celularesToSend.push({ id: 1, tipo: "formulario", numero: phoneInput });
    }

    if (isAuthenticated && user?.celular && typeof user.celular === 'string' && user.celular !== phoneInput) {
      celularesToSend.push({ id: 2, tipo: "usuario_autenticado", numero: user.celular });
    }

    const payload = {
      accion: "registrarProspectos",
      nombre: isAuthenticated && user?.nombre ? user.nombre : "Prospecto",
      apellido: isAuthenticated && user?.apellido ? user.apellido : "Anónimo",
      email: primaryEmailForPayload,
      id_tipo_usuario: isAuthenticated && user?.id_tipo_usuario ? user.id_tipo_usuario : null,
      id_curso: idCursoDestacado,
      destacado: 1,
      celular: celularesToSend,
      correos: correosToSend,
    };

    console.log("Payload a enviar a la API:", payload);

    try {
      const response = await fetch("https://apiacademy.hitpoly.com/ajax/cargarProspectosController.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setSnackbarMessage("¡Solicitud procesada con éxito! Se han añadido o actualizado tus datos.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true); // Muestra éxito general si no hay redirección directa
        setEmailInput(""); // Limpiar el input tras el éxito
        setPhoneInput(""); // Limpiar el input del celular
      } else {
        // Si la API indica que el email ya está registrado, redirigir sin mensaje de Snackbar
        if (data.message && data.message.includes("ya está registrado")) {
            console.log("Email ya registrado. Redirigiendo a /dashboard.");
            navigate("/dashboard"); // Redirige inmediatamente
            // No se muestra Snackbar ni se limpia el formulario aquí
            return; // Detener la ejecución para no afectar la redirección
        } else {
            // Para cualquier otro tipo de error de la API
            setSnackbarMessage(data.message || "Error al procesar la solicitud. Inténtalo de nuevo.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true); // Muestra el Snackbar para errores
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSnackbarMessage("Error de conexión. Por favor, verifica tu internet.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Muestra el Snackbar para errores de conexión
    } finally {
      // Siempre detenemos el indicador de carga
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: { xs: "column" },
          gap: 2,
          mt: 2,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%" }}>
          <TextField
            label="Tu correo electrónico (nuevo)"
            variant="outlined"
            type="email"
            size="small"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Tu número de celular (nuevo)"
            variant="outlined"
            type="tel"
            size="small"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: "#F21C63",
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Regístrate ahora"}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <SnackbarAlert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>
    </>
  );
};

export default EmailSubscriptionForm;