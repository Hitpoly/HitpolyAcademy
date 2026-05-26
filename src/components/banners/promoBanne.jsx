import { Box, Button, Typography } from "@mui/material";

const PromoBanner = ({ titulo, descripcion, enlace, urlImagen }) => {
  return (
    <Box
      sx={{
        height: { xs: "auto", md: "80vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#6C4DE2",
        padding: {xs: 2, md: 0},
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Texto */}
      <Box
        sx={{
          flex: 1,
          zIndex: 2,
          px: { xs: 0, md: 10 },
          py: { xs: 2, md: 0 },
          width: { xs: "100%", md: "50%" },
        }}
      >
        <Typography variant="h2" sx={{ color: "#fff", mb: 2, fontSize: "3rem" }}>
          {titulo || "Título del Anuncio"}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#f0f0f0", mb: 3 }}>
          {descripcion || "Descripción del anuncio."}
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
            href={enlace}
            target="_blank"
            rel="noopener noreferrer"
          >
            Más información
          </Button>
        </Box>
      </Box>

      {/* Imagen */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "auto", md: "100%" },
          clipPath: {
            xs: "none",
            md: "polygon(20% 0, 0 100%, 100% 100%, 100% 0%)",
          },
        }}
      >
        <img
          src={urlImagen || "/images/placeholder.jpg"}
          alt={titulo || "Banner promocional"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>

      {/* Botón móvil */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          width: "100%",
          zIndex: 2,
          mt: {xs: 4, md: 2},
        }}
      >
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
          href={enlace}
          target="_blank"
          rel="noopener noreferrer"
        >
          Más información
        </Button>
      </Box>
    </Box>
  );
};

export default PromoBanner;
