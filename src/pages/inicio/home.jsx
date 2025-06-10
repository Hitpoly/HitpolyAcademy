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

const alumnosData = [
  {
    img: "/images/Foto1.jpg",
    nombre: "Sofía García",
    linkedin: "https://www.linkedin.com/in/sofia-garcia-ejemplo1",
  },
  {
    img: "/images/Foto2.png",
    nombre: "Mateo Sánchez",
    linkedin: "https://www.linkedin.com/in/mateo-sanchez-ejemplo2",
  },
  {
    img: "/images/Foto3.jpg",
    nombre: "Valentina Díaz",
    linkedin: "https://www.linkedin.com/in/isabella-vargas-ejemplo4",
  },
  {
    img: "/images/Foto4.png",
    nombre: "Sebastián Ruiz",
    linkedin: "https://www.linkedin.com/in/sebastian-ruiz-ejemplo3",
  },
  {
    img: "/images/Foto5.png",
    nombre: "Isabella Vargas",
    linkedin: "https://www.linkedin.com/in/isabella-vargas-ejemplo4",
  },
  {
    img: "/images/Foto6.png",
    nombre: "Diego Torres",
    linkedin: "https://www.linkedin.com/in/isabella-vargas-ejemplo4",
  },
  {
    img: "/images/Foto7.png",
    nombre: "Camila López",
    linkedin: "https://www.linkedin.com/in/camila-lopez-ejemplo5",
  },
  {
    img: "/images/Foto8.png",
    nombre: "Daniel Castro",
    linkedin: "https://www.linkedin.com/in/daniel-castro-ejemplo6",
  },
  {
    img: "/images/Foto9.png",
    nombre: "Luciana Morales",
    linkedin: "https://www.linkedin.com/in/isabella-vargas-ejemplo4",
  },
  {
    img: "/images/Foto10.png",
    nombre: "Javier Herrera",
    linkedin: "https://www.linkedin.com/in/javier-herrera-ejemplo7",
  },
  {
    img: "/images/Foto13.jpg",
    nombre: "Mariana Gómez",
    linkedin: "https://www.linkedin.com/in/mariana-gomez-ejemplo8",
  },
  {
    img: "/images/Foto14.png",
    nombre: "Alejandro Flores",
    linkedin: "https://www.linkedin.com/in/isabella-vargas-ejemplo4",
  },
  {
    img: "/images/Foto12.png",
    nombre: "Valeria Rojas",
    linkedin: "https://www.linkedin.com/in/valeria-rojas-ejemplo9",
  },
  {
    img: "/images/Foto11.jpg",
    nombre: "Emiliano Pérez",
    linkedin: "https://www.linkedin.com/in/emiliano-perez-ejemplo10",
  },
];

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
            Alumnos Activos
          </Typography>
        </Box>
        <Box
          sx={{
            flex: { xs: "0 0 100%", sm: "0 0 60%" }, // 100% de ancho en xs, 60% en sm y superiores
            paddingLeft: { xs: 0, sm: 2 },
            paddingY: { xs: "20px", sm: 0 }, // Añadir padding vertical en móvil para el carrusel
          }}
        >
          <CarouselWithSwiper alumnos={alumnosData} />
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
