// src/components/ProfileInfoSection.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Stack,
  Link,
  IconButton,
  List, // Importar List para la lista de cursos
  ListItem, // Importar ListItem para cada elemento de la lista
  ListItemIcon, // Opcional, para iconos en la lista
  ListItemText, // Para el texto de cada elemento de la lista
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import SchoolIcon from "@mui/icons-material/School"; // Icono para cursos

// ¡Ya no necesitamos importar CompletedCoursesSection aquí!

const ProfileInfoSection = ({
  profile,
  editMode,
  tempProfile,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffff",
        flex: { xs: "0 0 100%", md: "1" },
        minWidth: { md: 280 },
        p: { xs: 3, md: 3 },
        overflowY: { xs: "visible", md: "auto" },
        maxHeight: { xs: "none", md: "100%" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Avatar
          src={profile.avatar}
          alt={profile.nombre}
          sx={{
            width: { xs: 150, sm: 150 },
            height: { xs: 150, sm: 150 },
            border: "4px solid #6C4DE2",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            mb: 3,
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#333",
            textAlign: "center",
          }}
        >
          {profile.nombre}
          {!editMode && (
            <IconButton
              aria-label="editar perfil"
              onClick={onEditClick}
              sx={{ ml: 1, p: 0.5, color: "#6C4DE2" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: { xs: 3, md: 5 },
          width: "100%",
          borderTop: { xs: "1px solid #e0e0e0", md: "none" },
          pt: { xs: 3, md: 0 },
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
          Información del Alumno
        </Typography>

        {!editMode ? (
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EmailIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
              <Typography variant="body1">
                <Typography component="span" fontWeight="bold">
                  Email:
                </Typography>{" "}
                {profile.email}
              </Typography>
            </Box>
            {profile.linkedin && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinkedInIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    LinkedIn:
                  </Typography>{" "}
                  <Link
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.linkedin.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.facebook && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FacebookIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Facebook:
                  </Typography>{" "}
                  <Link
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.facebook.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.instagram && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <InstagramIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Instagram:
                  </Typography>{" "}
                  <Link
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.instagram.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <DescriptionIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2", mt: 0.5 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Sobre mí:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.bio}
                </Typography>
              </Box>
            </Box>

            {/* Sección para Cursos Terminados dentro de ProfileInfoSection */}
            {profile.cursosCulminados && profile.cursosCulminados.length > 0 && (
              <Box sx={{ mt: 3, width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
                  Cursos Culminados
                </Typography>
                <List dense>
                  {profile.cursosCulminados.map((course) => (
                    <ListItem key={course.id} disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <SchoolIcon sx={{ color: "#6C4DE2", fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={course.titulo} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Nombre Completo"
              name="nombre"
              value={tempProfile.nombre}
              onChange={onChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              value={tempProfile.email}
              onChange={onChange}
              fullWidth
              type="email"
              variant="outlined"
            />
            <TextField
              label="Perfil de LinkedIn"
              name="linkedin"
              value={tempProfile.linkedin || ""}
              onChange={onChange}
              fullWidth
              type="url"
              variant="outlined"
            />
            <TextField
              label="Perfil de Facebook"
              name="facebook"
              value={tempProfile.facebook || ""}
              onChange={onChange}
              fullWidth
              type="url"
              variant="outlined"
            />
            <TextField
              label="Perfil de Instagram"
              name="instagram"
              value={tempProfile.instagram || ""}
              onChange={onChange}
              fullWidth
              type="url"
              variant="outlined"
            />
            <TextField
              label="Biografía"
              name="bio"
              value={tempProfile.bio}
              onChange={onChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={onSaveClick}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancelClick}
                sx={{
                  borderColor: "#f44336",
                  color: "#f44336",
                  "&:hover": { backgroundColor: "#ffebee", borderColor: "#d32f2f" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ProfileInfoSection;