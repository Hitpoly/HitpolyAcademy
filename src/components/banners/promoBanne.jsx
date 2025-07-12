import { Box, Button, Typography } from "@mui/material";

// PromoBanner ahora acepta 'orden' como una prop adicional
const PromoBanner = ({ titulo, descripcion, enlace, urlImagen, orden }) => {
  return (
    <Box
      sx={{
        height: {xs: "100%", md: "80vh"},
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#6C4DE2",
        padding: { xs: "30px 10px", md: "30px 150px" },
        gap: 4,
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        // Puedes usar 'orden' aquí si lo necesitas para estilos condicionales, por ejemplo:
        // border: orden === 1 ? '2px solid yellow' : 'none',
      }}
    >
      <Box sx={{ maxWidth: 500 }}>
        <Typography variant="h2" sx={{ color: "#fff", mb: 2 }}>
          {titulo || "Título del Anuncio"} {/* Contenido dinámico */}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#f0f0f0", mb: 3 }}>
          {descripcion || "Descripción del anuncio."} {/* Contenido dinámico */}
        </Typography>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#fff",
              color: "#F21C63",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
            href={enlace} // Enlace dinámico
            target="_blank" // Abrir en nueva pestaña
            rel="noopener noreferrer" // Seguridad
          >
            Más información
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: "black",
          maxWidth: { xs: "100%", md: 600 },
          width: "100%",
          height: { xs: "300px", md: "1500px" },
          overflow: "hidden",
          position: "relative",
          transform: { xs: "none", md: "rotate(15deg)" },
          transformOrigin: "center",
        }}
      >
        <img
          src={urlImagen || "/images/placeholder.jpg"}
          alt={titulo || "Banner promocional"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#fff",
            color: "#F21C63",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
          href={enlace} // Enlace dinámico
          target="_blank" // Abrir en nueva pestaña
          rel="noopener noreferrer" // Seguridad
        >
          Más información
        </Button>
      </Box>
    </Box>
  );
};

export default PromoBanner;