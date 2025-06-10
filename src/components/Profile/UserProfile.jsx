// src/components/UserProfile.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";
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
      descripcion:
        "Aprende a optimizar el flujo de bienes y servicios, desde el origen hasta el consumidor final.",
      progreso: 75,
      thumbnail: "/images/appointment1.jpg",
    },
    {
      id: 102,
      titulo: "Análisis de Datos con Power BI",
      descripcion:
        "Domina la creación de dashboards interactivos para la toma de decisiones empresariales.",
      progreso: 40,
      thumbnail: "/images/appointment1.jpg",
    },
    {
      id: 103,
      titulo: "Fundamentos de la Inteligencia Artificial",
      descripcion:
        "Explora los conceptos básicos y aplicaciones de la IA en el mundo moderno.",
      progreso: 20,
      thumbnail: "/images/appointment1.jpg",
    },
    {
      id: 104,
      titulo: "Liderazgo y Gestión de Equipos Ágiles",
      descripcion:
        "Desarrolla habilidades para liderar equipos de alto rendimiento en entornos ágiles.",
      progreso: 90,
      thumbnail: "/images/appointment1.jpg",
    },
  ],
};

const UserProfile = () => {
  const [profile, setProfile] = useState(initialProfileDataStudent);
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleEditClick = () => {
    setTempProfile(profile);
    setEditMode(true);
  };

  const handleSaveClick = () => {
    console.log("Guardando datos en la 'base de datos':", tempProfile);
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
        display: "flex",
        width: "100vw",
        minHeight: "calc(100vh - 65px)", 
        backgroundColor: "#eef2f6",
        position: "relative",
      }}
    >
      <Box
        sx={{
          borderRadius: 0,
          width: "100%",
          height: "calc(100vh - 65px)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          
        }}
      >
        <Box
          sx={{
            flex: "0 0 30%",
            position: "sticky",
            top: 0,
            height: "100%",
            overflow: "hidden",
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

        <Box
          sx={{
            width: "30%", 
            display: "flex",
            flexDirection: "column",
            overflowY: "auto", 
            paddingLeft: 2, 
            paddingRight: 2,
            paddingBottom: 2,

          }}
        >
          {profile.cursosEnProgreso && profile.cursosEnProgreso.length > 0 && (
            <InProgressCoursesSection courses={profile.cursosEnProgreso} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;