// src/pages/inicio/home.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
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
import axios from "axios";

const ENDPOINT_GET_ALL_ANUNCIOS = "https://apiacademy.hitpoly.com/ajax/getAllAnunciosController.php";

function Inicio() {
  const [allPromoBanners, setAllPromoBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [errorBanners, setErrorBanners] = useState(null);
  const fetchPromoBanners = useCallback(async () => {
    setLoadingBanners(true);
    setErrorBanners(null);
    try {
      const response = await axios.post(ENDPOINT_GET_ALL_ANUNCIOS, {
        accion: "getAll"
      });

      let fetchedAnuncios = [];
      if (response.data && Array.isArray(response.data.clases)) {
        fetchedAnuncios = response.data.clases;
      } else if (Array.isArray(response.data)) {
        fetchedAnuncios = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedAnuncios = response.data.data;
      }

      const activeAndSortedAnuncios = fetchedAnuncios
        .filter(anuncio => anuncio.estado === 'A' && anuncio.orden !== null && anuncio.orden !== undefined)
        .sort((a, b) => a.orden - b.orden);

      setAllPromoBanners(activeAndSortedAnuncios);
    } catch (err) {
      setErrorBanners("No se pudieron cargar los banners promocionales. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoBanners();
  }, [fetchPromoBanners]);

  const renderSpecificPromoBanner = (targetOrder) => {
    if (loadingBanners) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Cargando banner de orden {targetOrder}...</Typography>
        </Box>
      );
    }

    if (errorBanners) {
      return (
        <Box sx={{ py: 5 }}>
          <Alert severity="error">{errorBanners}</Alert>
        </Box>
      );
    }

    const anuncio = allPromoBanners.find(banner => banner.orden === targetOrder);

    if (anuncio) {
      return (
        <PromoBanner
          key={anuncio.id || `promo-banner-${anuncio.orden}`}
          titulo={anuncio.titulo}
          descripcion={anuncio.descripcion}
          enlace={anuncio.enlace}
          urlImagen={anuncio.urlImagen || anuncio.urlimagen}
          orden={anuncio.orden}
        />
      );
    } else {
      return (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay banner activo para el orden {targetOrder}.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <>
      <PortadaOne />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Box
          sx={{
            position: "relative",
            flex: { xs: "0 0 100%", sm: "0 0 40%" },
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-start" },
            alignItems: "center",
            padding: { xs: "20px 16px", sm: 0 },
            paddingLeft: { xs: 0, sm: "40px" },
            backgroundColor: "#6C4DE2",
            color: "white",
            clipPath: {
              xs: "none",
              sm: "polygon(0 0, 100% 0, 60% 100%, 0 100%)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
              fontWeight: "bold",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Comunidad Activa
          </Typography>
        </Box>
        <Box
          sx={{
            flex: { xs: "0 0 100%", sm: "0 0 60%" },
            paddingLeft: { xs: 0, sm: 2 },
            paddingY: { xs: "20px", sm: 0 },
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

      {renderSpecificPromoBanner(1)}

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

      {renderSpecificPromoBanner(2)}

      <CommunitySection />
      <CenteredCallToAction />
      <Footer />
    </>
  );
}

export default Inicio;