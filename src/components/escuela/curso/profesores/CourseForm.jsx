// components/escuela/curso/profesores/CourseForm.jsx
import React from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import CourseDetailsSection from "./CourseDetailsSection"; // La ruta puede variar
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import useCourseFormLogic from "./logic/useCourseFormLogic";

const CourseForm = () => {
  const navigate = useNavigate();

  const {
    formData,
    categorias,
    loadingCategories,
    categoryErrorMessage,
    newLogoText,
    setNewLogoText,
    newDescription,
    setNewDescription,
    newTemaTitle,
    setNewTemaTitle,
    bannerFile,
    cardCoverFile, // <-- Asegúrate de extraerlo aquí
    isEditing,
    loading,
    uploadingBanner,
    uploadingCardCover, // <-- Asegúrate de extraerlo aquí
    responseMessage,
    handleChange,
    handleFileChange, // <-- Función para el banner
    handleChangeCardCover, // <-- Función para la portada de tarjeta
    handleAddMarcaPlataforma,
    handleRemoveMarcaPlataforma,
    handleEditMarcaPlataforma,
    handleAddTema,
    handleRemoveTema,
    handleEditTema,
    handleSubmit,
    handleNavigateToMyCourses,
    isMobile,
  } = useCourseFormLogic();

  const handleNavigateToFaq = () => {
    if (formData?.id) {
       navigate(`/preguntas-frecuentes/${formData.id}`); 
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        boxShadow: 3,
        p: { xs: 2, md: 4 },
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 3 }}
      >
        {isEditing
          ? `Editar Curso: ${formData.titulo || "Cargando..."}`
          : "Insertar Nuevo Curso"}
      </Typography>

      {isEditing && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            onClick={handleNavigateToFaq}
            variant="contained"
            color="secondary"
          >
            Editar Preguntas Frecuentes
          </Button>
          <Button
            onClick={handleNavigateToMyCourses}
            variant="outlined"
          >
            ← Volver a Mis Cursos
          </Button>
        </Box>
      )}

      {!isEditing && (
        <Button
          onClick={handleNavigateToMyCourses}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          → Ir a Mis Cursos
        </Button>
      )}

      {responseMessage.message && (
        <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
          {responseMessage.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "calc(50% - 1.5rem)" } }}>
            <Typography variant="h6" gutterBottom>
              Datos Principales del Curso
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CourseDetailsSection
                  formData={formData}
                  handleChange={handleChange}
                  bannerFile={bannerFile}
                  cardCoverFile={cardCoverFile} // <-- ¡Pásale el archivo de la portada de tarjeta!
                  handleFileChange={handleFileChange} // <-- Para el banner
                  handleChangeCardCover={handleChangeCardCover} // <-- ¡Pásale la función para la portada de tarjeta!
                  uploadingBanner={uploadingBanner}
                  uploadingCardCover={uploadingCardCover} // <-- Pásale el estado de carga para la portada
                  categorias={categorias}
                  loadingCategories={loadingCategories}
                  categoryErrorMessage={categoryErrorMessage}
                  isEditing={isEditing}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ minWidth: { xs: "100%", md: "calc(50% - 1.5rem)" } }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AdditionalDetailsSection
                  formData={formData}
                  handleChange={handleChange}
                  newLogoText={newLogoText}
                  setNewLogoText={setNewLogoText}
                  newDescription={newDescription}
                  setNewDescription={setNewDescription}
                  handleAddMarcaPlataforma={handleAddMarcaPlataforma}
                  handleRemoveMarcaPlataforma={handleRemoveMarcaPlataforma}
                  handleEditMarcaPlataforma={handleEditMarcaPlataforma}
                  newTemaTitle={newTemaTitle}
                  setNewTemaTitle={setNewTemaTitle}
                  handleAddTema={handleAddTema}
                  handleRemoveTema={handleRemoveTema}
                  handleEditTema={handleEditTema}
                  isMobile={isMobile}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3, py: 1.5, width: "100%" }}
          disabled={loading || uploadingBanner || uploadingCardCover}
        >
          {loading || uploadingBanner || uploadingCardCover ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEditing ? (
            "Guardar Cambios"
          ) : (
            "Crear Curso"
          )}
        </Button>
      </form>
    </Box>
  );
};

export default CourseForm;