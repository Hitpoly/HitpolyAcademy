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

  const handleManageProfileClick = () => {
    navigate("/perfil");
    setOpen(false);
  };

  const drawerContent = (
    <Box sx={{ width: 250, padding: 2 }} role="presentation">
      <br />
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
          src={user?.url_foto_perfil} // ¡SOLUCIÓN AQUÍ! Usar 'url_foto_perfil'
        >
          {/* La lógica de fallback también debe usar la misma propiedad si no hay URL */}
          {!user?.url_foto_perfil &&
            `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`}
        </Avatar>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: "1rem" }}>
            Hola, {user?.nombre} {user?.apellido}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleManageProfileClick}
            sx={{
              mt: 1,
              borderRadius: 5,
              backgroundColor: "#6C4DE2",
              '&:hover': {
                backgroundColor: "#5a3cb8",
              },
              color: "white",
              textTransform: "none",
              px: 2,
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
          src={user?.url_foto_perfil} // ¡SOLUCIÓN AQUÍ! Usar 'url_foto_perfil'
        >
          {!user?.url_foto_perfil &&
            `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`}
        </Avatar>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </div>
  );
}