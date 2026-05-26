import React from "react";
import { Box, Typography, Container, Breadcrumbs, Link } from "@mui/material";
import InProgressCoursesSection from "../../components/Profile/components/InProgressCoursesSection";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const StudentCoursesPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7f9' }}>
      {/* Banner de Bienvenida Premium */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2D1638 0%, #1c1d1f 100%)',
          color: 'white',
          pt: { xs: 12, md: 15 },
          pb: { xs: 8, md: 10 },
          px: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decoración de fondo */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(242, 28, 99, 0.1)',
          filter: 'blur(80px)'
        }} />

        <Container maxWidth="lg">
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />}
            sx={{ mb: 3, '& .MuiTypography-root': { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' } }}
          >
            <Link underline="hover" color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
              Academia
            </Link>
            <Typography color="white">Mi Panel</Typography>
            <Typography color="#f21c63" sx={{ fontWeight: 'bold' }}>Mis Cursos</Typography>
          </Breadcrumbs>
          
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 800, 
            mb: 2,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            letterSpacing: '-1px'
          }}>
            Tus <span style={{ color: '#f21c63' }}>Cursos</span>
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.85, 
            fontWeight: 400, 
            maxWidth: '600px',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.2rem' }
          }}>
            Aquí puedes ver tu progreso académico, continuar con tus lecciones y alcanzar tus metas profesionales.
          </Typography>
        </Container>
      </Box>

      {/* Contenido Principal */}
      <Container maxWidth="lg" sx={{ mt: -6, pb: 10, position: 'relative', zIndex: 2 }}>
        <Box 
          sx={{ 
            backgroundColor: 'white', 
            borderRadius: 5, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            p: { xs: 3, md: 6 },
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <InProgressCoursesSection showTitle={false} />
        </Box>
      </Container>
    </Box>
  );
};

export default StudentCoursesPage;
