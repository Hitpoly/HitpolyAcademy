import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const CursoCard = ({
  id, // Recibimos el id directamente del objeto organizado en SectionCardGrid
  title,
  subtitle,
  banner,
  accessLink = "",
  instructorName,
  rating,
  reviews,
  price,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // 1. URL Dinámica para Redes Sociales (Apunta al puente PHP para leer Meta Tags)
  // Usamos el ID del curso para que compartir.php busque en la tabla raulzoto_academy.cursos
  const dynamicShareLink = `https://apiacademy.hitpoly.com/ajax/compartir.php?id=${id}`;

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(dynamicShareLink);
    const encodedTitle = encodeURIComponent(`¡Mira este curso en Hitpoly: ${title}!`);

    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(dynamicShareLink);
      alert("¡Enlace dinámico copiado al portapapeles!");
    } else if (platform === "instagram") {
      // Instagram no permite enlaces directos, copiamos el link para que lo peguen
      navigator.clipboard.writeText(dynamicShareLink);
      alert("Enlace copiado. Instagram no permite compartir links directos desde la web; puedes pegarlo en tus mensajes o biografía.");
    } else {
      window.open(links[platform], "_blank", "width=600,height=400");
    }
    handleCloseMenu();
  };

  return (
    <Card
      sx={{
        width: { xs: "300px", md: "100%" },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px", // Bordes un poco más modernos
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease-in-out",
        "&:hover": { transform: "translateY(-4px)" },
        overflow: "hidden",
      }}
    >
      {/* Imagen del curso (Columna url_banner en tu DB) */}
      {banner && (
        <CardMedia 
          component="img" 
          height="160" 
          image={banner} 
          alt={title} 
          sx={{ objectFit: "cover", bgcolor: "#f0f0f0" }} 
        />
      )}

      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: "1rem",
              lineHeight: 1.2,
              height: "2.4em",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              color: "#1c1d1f",
            }}
          >
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {instructorName || "Instructor Academia"}
          </Typography>
        </Box>

        {/* Rating Dinámico */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#b4690e", mr: 0.5 }}>
            {rating || "0.0"}
          </Typography>
          <Rating value={parseFloat(rating) || 0} precision={0.1} readOnly size="small" sx={{ color: "#e59819" }} />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            ({reviews || 0})
          </Typography>
        </Box>

        <Box sx={{ mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1c1d1f" }}>
              {price}
            </Typography>
            
            <Tooltip title="Compartir este curso">
              <IconButton onClick={handleOpenMenu} size="small" sx={{ color: "#6F4CE0" }}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              PaperProps={{ sx: { borderRadius: '10px', mt: 1 } }}
            >
              <MenuItem onClick={() => handleShare("facebook")}>
                <ListItemIcon><FacebookIcon fontSize="small" sx={{ color: "#1877F2" }} /></ListItemIcon>
                <ListItemText>Facebook</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleShare("whatsapp")}>
                <ListItemIcon><WhatsAppIcon fontSize="small" sx={{ color: "#25D366" }} /></ListItemIcon>
                <ListItemText>WhatsApp</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleShare("linkedin")}>
                <ListItemIcon><LinkedInIcon fontSize="small" sx={{ color: "#0A66C2" }} /></ListItemIcon>
                <ListItemText>LinkedIn</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleShare("instagram")}>
                <ListItemIcon><InstagramIcon fontSize="small" sx={{ color: "#E4405F" }} /></ListItemIcon>
                <ListItemText>Instagram</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleShare("copy")}>
                <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Copiar Enlace</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          <Button
            variant="outlined"
            fullWidth
            href={accessLink}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              borderColor: "#1c1d1f",
              color: "#1c1d1f",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#f7f9fa", borderColor: "#1c1d1f" },
            }}
          >
            Ver más información
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CursoCard;