import React from "react";
import { Box, Grid, Typography, Link, Divider } from "@mui/material";

const Footer = () => {
  return (
    <>
      <Box sx={{ display: { xs: "block", md: "flex" }, paddingTop: 5 }}>
        <Typography
          sx={{ px: 4, py: 2 }}
          variant="h6"
          fontWeight="bold"
          gutterBottom
        >
          Hitpoly
        </Typography>
        <Box
          sx={{
            backgroundColor: "#ffff",
            px: 4,
            py: 0,
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Asóciate con nosotros
              </Typography>
              <Link href="#" underline="hover" display="block">
                Acerca de
              </Link>
              <Link href="#" underline="hover" display="block">
                edX para empresas
              </Link>
              <Link href="#" underline="hover" display="block">
                Afiliados
              </Link>
              <Link href="#" underline="hover" display="block">
                Open edX
              </Link>
              <Link href="#" underline="hover" display="block">
                Consejo Asesor 2U
              </Link>
              <Link href="#" underline="hover" display="block">
                Carreras
              </Link>
              <Link href="#" underline="hover" display="block">
                Noticias
              </Link>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Conectar
              </Typography>
              <Link href="#" underline="hover" display="block">
                Centro de ideas
              </Link>
              <Link href="#" underline="hover" display="block">
                Contáctenos
              </Link>
              <Link href="#" underline="hover" display="block">
                Centro de ayuda
              </Link>
              <Link href="#" underline="hover" display="block">
                Seguridad
              </Link>
              <Link href="#" underline="hover" display="block">
                Kit de medios
              </Link>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Legal
              </Typography>
              <Link href="#" underline="hover" display="block">
                Condiciones de servicio y código de honor
              </Link>
              <Link href="#" underline="hover" display="block">
                Política de privacidad
              </Link>
              <Link href="#" underline="hover" display="block">
                Política de cookies
              </Link>
              <Link href="#" underline="hover" display="block">
                Política de accesibilidad
              </Link>
              <Link href="#" underline="hover" display="block">
                Política de marcas registradas
              </Link>
              <Link href="#" underline="hover" display="block">
                Declaración sobre la esclavitud moderna
              </Link>
              <Link href="#" underline="hover" display="block">
                Mapa del sitio
              </Link>
              <Link href="#" underline="hover" display="block">
                Sus opciones de privacidad
              </Link>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "20px 30px",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Hitpoly
        </Typography>
      </Box>
    </>
  );
};

export default Footer;
