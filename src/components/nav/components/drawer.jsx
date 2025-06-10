import React, { useState } from "react";
import {
  Box,
  Drawer,
  Button,
  Typography,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TemporaryDrawer() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleManageProfileClick = () => { // Nueva función para el botón
    navigate("/perfil"); // Navega a /perfil
    setOpen(false); // Cierra el Drawer después de navegar
  };

  const drawerContent = (
    <Box sx={{ width: 250, padding: 2 }} role="presentation">
      <br />
      {/* Box para Avatar y Texto (ahora sin clic para navegar) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          marginBottom: 2,
        }}
      >
        <Avatar
          sx={{ bgcolor: "primary.main", width: 64, height: 64 }}
          src={user?.avatar}
        >
          {!user?.avatar &&
            `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`}
        </Avatar>

        {/* El Box del nombre ya no tiene onClick para navegar */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: "1rem" }}>
            Hola, {user?.nombre} {user?.apellido}
          </Typography>
          {/* Botón "Gestiona tu perfil" */}
          <Button
            variant="contained" // o "outlined" si prefieres
            size="small"
            onClick={handleManageProfileClick} // Asocia la navegación al botón
            sx={{
              mt: 1, // Margen superior
              borderRadius: 5, // Bordes redondeados para que sea un "cotoncito obajado"
              backgroundColor: "#6C4DE2", // Color de fondo personalizado
              '&:hover': {
                backgroundColor: "#5a3cb8", // Color de fondo al pasar el ratón
              },
              color: "white", // Color del texto
              textTransform: "none", // Evita mayúsculas automáticas
              px: 2, // Padding horizontal
            }}
          >
            Gestiona tu perfil
          </Button>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ paddingTop: 3 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={logout}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)} sx={{ padding: 0 }}>
        <Avatar
          sx={{ bgcolor: "primary.main", cursor: "pointer" }}
          src={user?.avatar}
        >
          {!user?.avatar &&
            `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`}
        </Avatar>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </div>
  );
}