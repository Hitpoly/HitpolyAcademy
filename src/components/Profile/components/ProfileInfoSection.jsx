import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Stack,
  Link,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import SchoolIcon from "@mui/icons-material/School";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Swal from "sweetalert2";
import axios from "axios";

import { useAuth } from "../../../context/AuthContext";

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
};

const ProfileInfoSection = () => {
  const { user, login } = useAuth();
  const userId = user?.id;

  const initialProfile = user
    ? {
        ...user,
        bio: user.biografia || "", 
        avatar: user.url_foto_perfil || "/images/default-avatar.png", 
        cursosCulminados: user.cursosCulminados || [],
        url_linkedin: user.url_linkedin || "",
        url_facebook: user.url_facebook || "",
        url_instagram: user.url_instagram || "",
        url_tiktok: user.url_tiktok || "",
      }
    : null;

  const [profile, setProfile] = useState(initialProfile);
  const [tempProfile, setTempProfile] = useState(null); 
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [urlLinkedinError, setUrlLinkedinError] = useState(null);
  const [urlFacebookError, setUrlFacebookError] = useState(null);
  const [urlInstagramError, setUrlInstagramError] = useState(null);
  const [urlTiktokError, setUrlTiktokError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        bio: user.biografia || "",
        avatar: user.url_foto_perfil || "/images/default-avatar.png",
        cursosCulminados: user.cursosCulminados || [],
        url_linkedin: user.url_linkedin || "",
        url_facebook: user.url_facebook || "",
        url_instagram: user.url_instagram || "",
        url_tiktok: user.url_tiktok || "",
      });
    } else {
      setProfile(null); 
    }
  }, [user]); 

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
        throw new Error("No se recibió una URL válida desde el backend de Cloudinary.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "Ocurrió un error al intentar subir la imagen de perfil.",
      });
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditClick = () => {
    // Al entrar en modo edición, copiamos el perfil actual (que viene del contexto)
    setTempProfile({ ...profile });
    setEditMode(true);
    setSuccessMessage(null);
    setNewAvatarFile(null);
    setPreviewAvatarUrl(null);
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);
    setUrlTiktokError(null);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setTempProfile(null);
    setError(null);
    setNewAvatarFile(null);
    setPreviewAvatarUrl(null);
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);
    setUrlTiktokError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "url_linkedin") setUrlLinkedinError(null);
    if (name === "url_facebook") setUrlFacebookError(null);
    if (name === "url_instagram") setUrlInstagramError(null);
    if (name === "url_tiktok") setUrlTiktokError(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewAvatarUrl(URL.createObjectURL(file));
    } else {
      setNewAvatarFile(null);
      setPreviewAvatarUrl(null);
    }
  };

  const handleSaveClick = async () => {
    if (!userId) {
      setError("No se puede guardar el perfil: ID de usuario no disponible.");
      return;
    }

    let hasValidationError = false;
    setUrlLinkedinError(null);
    setUrlFacebookError(null);
    setUrlInstagramError(null);
    setUrlTiktokError(null);

    if (tempProfile.url_linkedin && !isValidUrl(tempProfile.url_linkedin)) {
      setUrlLinkedinError("URL de LinkedIn inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }
    if (tempProfile.url_facebook && !isValidUrl(tempProfile.url_facebook)) {
      setUrlFacebookError("URL de Facebook inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }
    if (tempProfile.url_instagram && !isValidUrl(tempProfile.url_instagram)) {
      setUrlInstagramError("URL de Instagram inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }
    if (tempProfile.url_tiktok && !isValidUrl(tempProfile.url_tiktok)) {
      setUrlTiktokError("URL de TikTok inválida. Debe incluir 'http://' o 'https://'.");
      hasValidationError = true;
    }

    if (hasValidationError) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, corrige las URLs de redes sociales inválidas.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    let finalAvatarUrl = tempProfile.avatar;

    if (newAvatarFile) {
      try {
        finalAvatarUrl = await uploadAvatarToCloudinary(newAvatarFile);
      } catch (uploadError) {
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        accion: "editar",
        id: userId,
        nombre: tempProfile.nombre,
        email: tempProfile.email,
        url_linkedin: tempProfile.url_linkedin,
        url_facebook: tempProfile.url_facebook,
        url_instagram: tempProfile.url_instagram,
        url_tiktok: tempProfile.url_tiktok,
        biografia: tempProfile.bio,
        url_foto_perfil: finalAvatarUrl,
      };

      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/editarUsuarioController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de red al guardar: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setProfile({ ...tempProfile, avatar: finalAvatarUrl });
        const updatedUserInContext = {
          ...user, 
          nombre: tempProfile.nombre,
          email: tempProfile.email,
          url_linkedin: tempProfile.url_linkedin,
          url_facebook: tempProfile.url_facebook,
          url_instagram: tempProfile.url_instagram,
          url_tiktok: tempProfile.url_tiktok,
          biografia: tempProfile.bio,
          url_foto_perfil: finalAvatarUrl, 
        };
        login(updatedUserInContext); 

        setEditMode(false);
        setNewAvatarFile(null);
        setPreviewAvatarUrl(null);
        setSuccessMessage("¡Perfil actualizado con éxito!");
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Perfil actualizado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setError(data.message || "Hubo un error al guardar los cambios.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudieron guardar los cambios.",
        });
      }
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor para guardar los cambios.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 3,
        }}
      >
        <Alert severity="info">Cargando información del usuario o no hay sesión iniciada.</Alert>
      </Box>
    );
  }

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
        <Box sx={{ position: "relative", mb: 3 }}>
          <Avatar
            src={previewAvatarUrl || profile.avatar}
            alt={profile.nombre}
            sx={{
              width: { xs: 150, sm: 150 },
              height: { xs: 150, sm: 150 },
              border: "4px solid #6C4DE2",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          />
          {editMode && (
            <IconButton
              component="label"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#6C4DE2",
                color: "white",
                "&:hover": { backgroundColor: "#5a3bbd" },
              }}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PhotoCameraIcon />
              )}
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </IconButton>
          )}
        </Box>

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
          {editMode ? (
            <TextField
              label="Nombre"
              name="nombre"
              value={tempProfile.nombre}
              onChange={handleChange}
              variant="standard"
              sx={{
                ".MuiInput-underline:before": { borderBottom: "none" },
                ".MuiInput-underline:after": { borderBottom: "none" },
              }}
            />
          ) : (
            profile.nombre
          )}

          {!editMode && (
            <IconButton
              aria-label="editar perfil"
              onClick={handleEditClick}
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

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

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
            {profile.url_linkedin && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinkedInIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    LinkedIn:
                  </Typography>{" "}
                  <Link
                    href={profile.url_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_linkedin.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.url_facebook && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FacebookIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Facebook:
                  </Typography>{" "}
                  <Link
                    href={profile.url_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_facebook.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.url_instagram && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <InstagramIcon color="action" sx={{ fontSize: 24, color: "#6C4DE2" }} />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    Instagram:
                  </Typography>{" "}
                  <Link
                    href={profile.url_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_instagram.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
                  </Link>
                </Typography>
              </Box>
            )}
            {profile.url_tiktok && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <img
                  src="/images/tiktok-icon.png"
                  alt="TikTok"
                  style={{ width: 24, height: 24, filter: 'grayscale(100%) brightness(0) invert(1) sepia(1) saturate(5000%) hue-rotate(250deg)' }}
                />
                <Typography variant="body1">
                  <Typography component="span" fontWeight="bold">
                    TikTok:
                  </Typography>{" "}
                  <Link
                    href={profile.url_tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.url_tiktok.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "")}
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

            {profile.cursosCulminados && profile.cursosCulminados.length > 0 && (
              <Box sx={{ mt: 3, width: "100%" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
                  Cursos Culminados
                </Typography>
                <Alert severity="info">La lista de cursos culminados no está implementada en este perfil.</Alert>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Email"
              name="email"
              value={tempProfile.email}
              onChange={handleChange}
              fullWidth
              type="email"
              variant="outlined"
            />
            <TextField
              label="Perfil de LinkedIn"
              name="url_linkedin"
              value={tempProfile.url_linkedin}
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlLinkedinError}
              helperText={urlLinkedinError}
            />
            <TextField
              label="Perfil de Facebook"
              name="url_facebook"
              value={tempProfile.url_facebook}
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlFacebookError}
              helperText={urlFacebookError}
            />
            <TextField
              label="Perfil de Instagram"
              name="url_instagram"
              value={tempProfile.url_instagram}
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlInstagramError}
              helperText={urlInstagramError}
            />
            <TextField
              label="Perfil de TikTok"
              name="url_tiktok"
              value={tempProfile.url_tiktok || ""}
              onChange={handleChange}
              fullWidth
              type="url"
              variant="outlined"
              error={!!urlTiktokError}
              helperText={urlTiktokError}
            />
            <TextField
              label="Biografía"
              name="bio"
              value={tempProfile.bio}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
            <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveClick}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
                disabled={uploadingAvatar || loading}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelClick}
                sx={{
                  borderColor: "#f44336",
                  color: "#f44336",
                  "&:hover": { backgroundColor: "#ffebee", borderColor: "#d32f2f" },
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                }}
                disabled={uploadingAvatar || loading}
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