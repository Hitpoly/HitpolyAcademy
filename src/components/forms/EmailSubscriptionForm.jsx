import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Dialog,
  Typography,
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EmailSubscriptionForm = ({ idCursoDestacado, onInputActivity }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // useEffect original con log para ver si detiene el carrusel
  useEffect(() => {
    if (onInputActivity) {
      const hasText = emailInput.length > 0 || phoneInput.length > 0;

      onInputActivity(hasText);
    }
  }, [emailInput, phoneInput, onInputActivity]);

  const handleSnackbarClose = (event, reason) => {

    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setOpenSnackbar(false);

    if (!emailInput) {

      setSnackbarMessage("Por favor, ingresa tu correo electrónico.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
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

    try {
      const response = await fetch("https://apiacademy.hitpoly.com/ajax/cargarProspectosController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Verificamos si la respuesta es JSON
      const text = await response.text();

      const data = JSON.parse(text);

      if (response.ok && (data.status === "success" || data.status === "warning")) {
        
        if (data.status === "warning" || (data.message && data.message.includes("ya está registrado"))) {
          setSnackbarMessage("¡Ya te tenemos registrado! Te contactaremos pronto de todas formas.");
        } else {
          setSnackbarMessage("¡Te contactaremos de inmediato! Estás a punto de empezar una de las carreras más demandadas a nivel internacional.");
        }
        
        setOpenSuccessDialog(true);
        setEmailInput("");
        setPhoneInput("");
      } else {
        setSnackbarMessage(data.message || "Error al procesar la solicitud. Inténtalo de nuevo.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage("Error de conexión. Por favor, verifica tu internet.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
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
          flexDirection: "column",
          gap: 2,
          mt: 2,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%" }}>
          <TextField
            label="Tu correo electrónico"
            variant="outlined"
            type="email"
            size="small"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Tu número de celular"
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
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: "#F21C63",
            "&:hover": { backgroundColor: "#d11652" },
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Regístrate ahora"}
        </Button>
      </Box>

      {/* SNACKBAR - FIJATE EN EL Z-INDEX */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <SnackbarAlert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>

      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: "20px",
            textAlign: "center",
            maxWidth: "450px",
            background: "linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>🎉</Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: "#F21C63" }}>
            {snackbarMessage.split('!')[0]}!
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
            {snackbarMessage.includes('!') ? snackbarMessage.split('!')[1].trim() : snackbarMessage}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenSuccessDialog(false)}
            sx={{
              backgroundColor: "#F21C63",
              borderRadius: "12px",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#d11652" }
            }}
          >
            ¡Entendido, gracias!
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default EmailSubscriptionForm; 