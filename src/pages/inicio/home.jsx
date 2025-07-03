import React from "react";
import { Box, Typography } from "@mui/material";
import PortadaOne from "../../components/banners/postadaOne";
import CarouselWithSwiper from "../../components/carruseles/CarruselOne";
import SectionCardGrid from "../../components/sections/sectionOne/section";
import PromoBanner from "../../components/banners/promoBanne";
import SectionTwo from "../../components/sections/sectionTwo/section";
import TestimoniosSection from "../../components/sections/testimonios/TestimonialOne";
import CommunitySection from "../../components/sections/comunidad/CommunitySection";
import CenteredCallToAction from "../../components/banners/llamadoALaAccion";
import Footer from "../../components/footer/pieDePagina";
import InteractiveBoxes from "../../components/sections/seccionesEducativas/InteractiveBoxes";


function Inicio() {
  return (
    <>
      <PortadaOne />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Columna en xs, fila en sm y superiores
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Box
          sx={{
            position: "relative",
            flex: { xs: "0 0 100%", sm: "0 0 40%" }, // 100% de ancho en xs, 40% en sm y superiores
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" }, // Centrar horizontalmente en móvil, izquierda en desktop
            alignItems: "center",
            padding: { xs: "20px 16px", sm: 0 }, // Padding para móviles, reiniciado en desktop
            paddingLeft: { xs: 0, sm: "40px" }, // Mantener padding izquierdo en desktop
            backgroundColor: "#6C4DE2",
            color: "white",
            // ¡Aquí el cambio clave para el corte diagonal en móviles!
            clipPath: {
              xs: "none", // Sin clip-path en móvil
              sm: "polygon(0 0, 100% 0, 60% 100%, 0 100%)", // Con clip-path en sm y superiores
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
              fontWeight: "bold",
              textAlign: { xs: "center", sm: "left" }, // Centrar texto en móvil, alinear a la izquierda en desktop
            }}
          >
            Comunidad Activa
          </Typography>
        </Box>
        <Box
          sx={{
            flex: { xs: "0 0 100%", sm: "0 0 60%" }, // 100% de ancho en xs, 60% en sm y superiores
            paddingLeft: { xs: 0, sm: 2 },
            paddingY: { xs: "20px", sm: 0 }, // Añadir padding vertical en móvil para el carrusel
          }}
        >
          <CarouselWithSwiper/>
        </Box>
      </Box>
      <Box
        sx={{
          paddingTop: { xs: "40px", md: "100px" },
          paddingBottom: { xs: "50px", md: "150px" },
          paddingLeft: { xs: "10px", md: "150px" },
          paddingRight: { xs: "10px", md: "150px" },
          backgroundColor: "#f4f4f4",
        }}
      >
        <SectionCardGrid />
      </Box>
      <PromoBanner />
      <Box
        sx={{
          paddingTop: { xs: "40px", md: "100px" },
          paddingBottom: { xs: "50px", md: "150px" },
          paddingLeft: { xs: "10px", md: "150px" },
          paddingRight: { xs: "10px", md: "150px" },
          backgroundColor: "#f4f4f4",
        }}
      >
        <SectionTwo />
      </Box>
      <Box
        sx={{
          paddingTop: { xs: "20px", md: "50px" },
          paddingBottom: { xs: "20px", md: "50px" },
          paddingLeft: { xs: "10px", md: "150px" },
          paddingRight: { xs: "10px", md: "150px" },
        }}
      >
        <InteractiveBoxes />
      </Box>
      <Box
        sx={{
          paddingTop: { xs: "60px", md: "50px" },
          paddingBottom: { xs: "80px", md: "120px" },
          paddingLeft: { xs: "10px", md: "150px" },
          paddingRight: { xs: "10px", md: "150px" },
        }}
      >
        <TestimoniosSection />
      </Box>
      <PromoBanner />
      <CommunitySection />
      <CenteredCallToAction />
      <Footer />
    </>
  );
}

export default Inicio;
