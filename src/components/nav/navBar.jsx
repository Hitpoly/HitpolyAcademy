import React, { useState } from "react";
import { Box, IconButton, Button, TextField, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Importa el icono que desees
import ListaDeNombres from "./components/MenuHamburguesa";
import TemporaryDrawer from "./components/drawer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SequencePopup from "../../components/popups/SequencePopup"; // Importa el componente SequencePopup

// Define los pasos específicos para la secuencia del popup "Soy Afiliado"
const affiliateSteps = [
  {
    title: "¡Bienvenido al Panel de Afiliados!",
    description: "Aquí te explicaremos cómo funciona nuestro programa de afiliados y cómo puedes empezar a ganar comisiones.",
    videoUrl: "/videos/afiliado_intro.mp4" // Reemplaza con tu video de introducción de afiliado
  },
  {
    title: "Genera tu Enlace Único",
    description: "Cada afiliado tiene un enlace de referencia personal. Asegúrate de usarlo para que podamos rastrear tus ventas.",
    videoUrl: "/videos/afiliado_link.mp4"
  },
  {
    title: "Materiales de Marketing",
    description: "Accede a nuestros recursos de marketing: banners, textos preescritos y guías para maximizar tus conversiones.",
    videoUrl: "/videos/afiliado_marketing.mp4"
  },
  {
    title: "Preguntas Frecuentes y Soporte",
    description: "Si tienes dudas, consulta nuestra sección de FAQ o contacta a nuestro equipo de soporte para ayuda personalizada.",
    videoUrl: "/videos/afiliado_faq.mp4"
  },
  {
    title: "¡Comienza a Ganar!",
    description: "Estás listo para promover y monetizar tu influencia. ¡Te deseamos mucho éxito en tu camino como afiliado!",
    videoUrl: "/videos/afiliado_final.mp4"
  },
];

const MenuDeNavegacion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAffiliatePopupOpen, setIsAffiliatePopupOpen] = useState(false); // Estado para el popup de afiliado
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  // Funciones para manejar la visibilidad del popup de afiliado
  const handleOpenAffiliatePopup = () => {
    setIsAffiliatePopupOpen(true);
  };

  const handleCloseAffiliatePopup = () => {
    setIsAffiliatePopupOpen(false);
  };

  // Esta función ahora solo cierra el popup, NO guarda nada en localStorage
  const handleAffiliateSequenceComplete = () => {
    console.log("Secuencia de afiliado completada.");
    handleCloseAffiliatePopup(); // Asegúrate de cerrar el popup al finalizar
  };

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: 1,
          backgroundColor: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1200,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={toggleDrawer(true)} color="inherit">
            <MenuIcon />
          </IconButton>
          <TextField
            sx={{ display: { xs: "none", md: "flex" } }}
            size="small"
            variant="outlined"
            placeholder="Buscar..."
          />
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "row" }}
          alignItems="center"
          marginRight={1}
          gap={2}
        >
          {!user ? (
            // Botones de "Registrarse" y "Ingresar" si el usuario NO está logueado
            <>
              <Button
                sx={{
                  border: "1px #F21C63 solid",
                  display: { xs: "none", md: "flex" },
                  width: "200px",
                  color: "#F21C63",
                  padding: "10px",
                }}
                color="primary"
                onClick={handleRegisterClick}
              >
                Registrarse
              </Button>
              <Button
                sx={{
                  backgroundColor: "#F21C63 ",
                  width: { xs: "120px", md: "200px" },
                  padding: { xs: "5px", md: "10px" },
                }}
                variant="contained"
                color="primary"
                onClick={handleLoginClick}
              >
                Ingresar
              </Button>
            </>
          ) : (
            // Contenido para usuarios logueados
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 2 }}
            >
              {/* Botón "Soy Afiliado" como IconButton para todas las pantallas */}
              <IconButton
                color="secondary"
                onClick={handleOpenAffiliatePopup}
                sx={{
                  border: '1px solid #1976d2',
                  borderRadius: '50%', // Forma circular
                  width: 40, // Tamaño del círculo
                  height: 40,
                  p: 0, // Remover padding interno para que el icono ocupe más espacio
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  }
                }}
              >
                <EmojiEventsIcon fontSize="small" /> {/* Icono de afiliado */}
              </IconButton>

              <TemporaryDrawer /> {/* Menú de usuario o perfil */}
            </Box>
          )}
        </Box>
      </Box>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <ListaDeNombres />
        </Box>
      </Drawer>

      {/* SequencePopup para Afiliados */}
      <SequencePopup
        steps={affiliateSteps}
        isOpen={isAffiliatePopupOpen}
        onClose={handleCloseAffiliatePopup}
        onSequenceComplete={handleAffiliateSequenceComplete}
      />
    </>
  );
};

export default MenuDeNavegacion;