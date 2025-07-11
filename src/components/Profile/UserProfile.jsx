// src/components/UserProfile.jsx
import React, { useState } from "react";
import { Box, useMediaQuery, useTheme, Typography } from "@mui/material";
import ProfileInfoSection from "./components/ProfileInfoSection";
import InProgressCoursesSection from "./components/InProgressCoursesSection";

const initialProfileDataStudent = {
  nombre: "Sofía García",
  email: "sofia.garcia@hitpoly.com",
  programa: "Certificación Profesional en Lean Six Sigma - HitPoly Academy",
  linkedin: "https://www.linkedin.com/in/sofia-garcia-ejemplo1",
  avatar: "/images/Foto1.jpg",
  bio: "Estudiante entusiasta con pasión por la mejora de procesos y la optimización de sistemas. Mi objetivo es aplicar las mejores prácticas para optimizar procesos y contribuir al éxito de proyectos innovadores.",
  rol: "alumno",
  cursosCulminados: [
    { id: 1, titulo: "Lean Six Sigma Yellow Belt" },
    { id: 2, titulo: "Introducción a la Gestión de Proyectos" },
    { id: 3, titulo: "Herramientas de Análisis de Datos" },
    { id: 4, titulo: "Metodologías Ágiles para Equipos" },
  ],
  cursosEnProgreso: [
    {
      id: 101,
      titulo: "Gestión de la Cadena de Suministro (Supply Chain)",
      subtitulo: // Cambiado de 'descripcion' a 'subtitulo' para CourseCardProgress
        "Aprende a optimizar el flujo de bienes y servicios, desde el origen hasta el consumidor final.",
      progreso: 75,
      portada_targeta: "/images/appointment1.jpg", // Cambiado de 'thumbnail' a 'portada_targeta'
    },
    {
      id: 102,
      titulo: "Análisis de Datos con Power BI",
      subtitulo:
        "Domina la creación de dashboards interactivos para la toma de decisiones empresariales.",
      progreso: 40,
      portada_targeta: "/images/appointment1.jpg",
    },
    {
      id: 103,
      titulo: "Fundamentos de la Inteligencia Artificial",
      subtitulo:
        "Explora los conceptos básicos y aplicaciones de la IA en el mundo moderno.",
      progreso: 20,
      portada_targeta: "/images/appointment1.jpg",
    },
    {
      id: 104,
      titulo: "Liderazgo y Gestión de Equipos Ágiles",
      subtitulo:
        "Desarrolla habilidades para liderar equipos de alto rendimiento en entornos ágiles.",
      progreso: 90,
      portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 105,
        titulo: "Marketing Digital Estratégico",
        subtitulo: "Diseña y ejecuta campañas que generen resultados.",
        progreso: 60,
        portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 106,
        titulo: "Finanzas para No Financieros",
        subtitulo: "Comprende los principios clave de la gestión financiera.",
        progreso: 85,
        portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 107,
        titulo: "Desarrollo de Habilidades de Comunicación",
        subtitulo: "Mejora tu capacidad para transmitir ideas de forma efectiva.",
        progreso: 30,
        portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 108,
        titulo: "Ciberseguridad Fundamentos",
        subtitulo: "Protege tus datos y sistemas contra amenazas digitales.",
        progreso: 55,
        portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 109,
        titulo: "Innovación y Design Thinking",
        subtitulo: "Aprende a generar soluciones creativas para problemas complejos.",
        progreso: 70,
        portada_targeta: "/images/appointment1.jpg",
    },
    {
        id: 110,
        titulo: "Gestión del Talento Humano",
        subtitulo: "Descubre cómo atraer, desarrollar y retener el mejor talento.",
        progreso: 45,
        portada_targeta: "/images/appointment1.jpg",
    },
  ],
};

const UserProfile = () => {
  const [profile, setProfile] = useState(initialProfileDataStudent);
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleEditClick = () => {
    setTempProfile(profile);
    setEditMode(true);
  };

  const handleSaveClick = () => {
    setProfile(tempProfile);
    setEditMode(false);
  };

  const handleCancelClick = () => {
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box
      sx={{
        backgroundColor: "#eef2f6",
        minHeight: "100vh",
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row", // Cambia la dirección a columna en pantallas pequeñas
        alignItems: isSmallScreen ? "center" : "flex-start", // Centra los ítems horizontalmente en pantallas pequeñas
        justifyContent: isSmallScreen ? "flex-start" : "flex-start", // Ajusta si es necesario, pero "flex-start" suele ser suficiente
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",
          alignItems: "center", // Centra las cajas en el eje transversal (horizontalmente en este caso)
          justifyContent: "center", // Centra las cajas en el eje principal (verticalmente en este caso) si no hay suficiente contenido
        },
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "300px", lg: "30%" }, // Ancho ajustado para móviles
          minWidth: { md: "280px" },
          position: isSmallScreen ? "static" : "fixed",
          top: isSmallScreen ? "auto" : "65px",
          left: 0,
          height: isSmallScreen ? "auto" : "calc(100vh - 65px)",
          overflowY: isSmallScreen ? "visible" : "auto",
          backgroundColor: "white",
          boxShadow: { xs: "0 2px 4px rgba(0,0,0,0.08)", md: "0 12px 24px rgba(0,0,0,0.15)" },
          borderRadius: { xs: 2, md: 0 },
          p: { xs: 2, md: 3 },
          mb: { xs: 3, md: 0 },
          zIndex: 1000,
          // Propiedades para centrar la caja en pantallas pequeñas
          mx: isSmallScreen ? "auto" : 0, // Centra horizontalmente usando auto margins
        }}
      >
        <ProfileInfoSection
          profile={profile}
          editMode={editMode}
          tempProfile={tempProfile}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
          onCancelClick={handleCancelClick}
          onChange={handleChange}
        />
      </Box>
      {!isSmallScreen && (
        <Box
          sx={{
            width: { md: "300px", lg: "30%" },
            minWidth: { md: "280px" },
            flexShrink: 0,
          }}
        />
      )}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: { xs: 0, md: 4 },
          backgroundColor: "#eef2f6",
          overflowY: "auto",
          [theme.breakpoints.down("md")]: {
            
            mt: isSmallScreen ? 3 : 0, // Añade un margen superior en móviles para separar las cajas
          },
        }}
      >
        {profile.cursosEnProgreso && profile.cursosEnProgreso.length > 0 ? (
          <InProgressCoursesSection courses={profile.cursosEnProgreso} />
        ) : (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            No hay cursos en progreso para mostrar.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;