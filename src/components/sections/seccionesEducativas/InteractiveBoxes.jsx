import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, useMediaQuery, useTheme, CircularProgress, Alert } from "@mui/material";

// Importar todos los iconos necesarios de forma explícita
import SchoolIcon from "@mui/icons-material/School";
import ScienceIcon from "@mui/icons-material/Science";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import TranslateIcon from "@mui/icons-material/Translate";
import PaletteIcon from "@mui/icons-material/Palette";
import ComputerIcon from "@mui/icons-material/Computer";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CodeIcon from "@mui/icons-material/Code";
import CalculateIcon from "@mui/icons-material/Calculate";
import BusinessIcon from "@mui/icons-material/Business";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PublicIcon from "@mui/icons-material/Public";
import SpaIcon from "@mui/icons-material/Spa";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

const iconMap = {
  "matemáticas": CalculateIcon,
  "ciencia": ScienceIcon,
  "historia": HistoryEduIcon,
  "lenguaje": TranslateIcon,
  "arte": PaletteIcon,
  "tecnología": ComputerIcon,
  "idiomas": TranslateIcon,
  "deportes": SportsSoccerIcon,
  "música": MusicNoteIcon,
  "programación": CodeIcon,
  "desarrollo": CodeIcon,
  "diseño": DesignServicesIcon,
  "marketing": TrendingUpIcon,
  "negocios": BusinessIcon,
  "habilidades": PsychologyIcon,
  "cultura": PublicIcon,
  "bienestar": SpaIcon,
  "personal": SelfImprovementIcon,
};

const getCategoryIcon = (categoryName) => {
  const lowerCaseName = categoryName.toLowerCase();
  for (const keyword in iconMap) {
    if (lowerCaseName.includes(keyword)) { 
      return iconMap[keyword];
    }
  }
  return SchoolIcon;
};

const InteractiveBoxes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error al cargar categorías: ${response.statusText}. Detalles: ${errorText}`
          );
        }

        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.categorias)) {
          setCategories(data.categorias);
        } else {
          throw new Error(data.message || "Datos de categorías inválidos.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box
      sx={{
        mt: "40px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h3" gutterBottom>
        Nuestras Secciones Educativas
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Explora todas las áreas de aprendizaje que ofrecemos en nuestra academia.
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 150,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Cargando categorías...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {categories.length > 0 ? (
            categories.map((category) => {
              // Aquí se utiliza la función dinámica para obtener el icono
              const IconComponent = getCategoryIcon(category.nombre);

              return (
                <Paper
                  key={category.id}
                  elevation={0}
                  sx={{
                    width: isMobile ? "calc(50% - 12px)" : 230,
                    height: { xs: 150, md: 250 },
                    backgroundColor: "#f4f4f4",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition:
                      "transform 0.3s, box-shadow 0.3s, background-color 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 3,
                      backgroundColor: "#5e17eb",
                      "& svg": {
                        color: "#fff",
                      },
                      "& h6": {
                        color: "#fff",
                      },
                    },
                  }}
                >
                  {/* Se renderiza el icono obtenido dinámicamente */}
                  {React.createElement(IconComponent, {
                    sx: { fontSize: 70, color: "#5e17eb" },
                  })}
                  <Typography variant="subtitle1" mt={1} textAlign="center">
                    {category.nombre}
                  </Typography>
                </Paper>
              );
            })
          ) : (
            <Typography variant="body1" sx={{ width: "100%", textAlign: "center", mt: 4 }}>
              No se encontraron categorías.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default InteractiveBoxes;