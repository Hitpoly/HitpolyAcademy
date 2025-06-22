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

import CourseDetailsSection from "./CourseDetailsSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import useCourseFormLogic from "./logic/useCourseFormLogic";

const CourseForm = () => {
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
    isEditing,
    loading,
    uploadingBanner,
    responseMessage,
    handleChange,
    handleFileChange,
    handleAddMarcaPlataforma,
    handleRemoveMarcaPlataforma,
    handleAddTema,
    handleRemoveTema,
    handleEditTema,
    handleSubmit,
    handleNavigateToMyCourses,
    isMobile,
  } = useCourseFormLogic();

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

      <Button
        onClick={handleNavigateToMyCourses}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        {isEditing ? "← Volver a Mis Cursos" : "→ Ir a Mis Cursos"}
      </Button>

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
          <Box
            sx={{
              flex: 1, 
              minWidth: { xs: "100%", md: "calc(50% - 1.5rem)" },
            
            }}
          >
            <Typography variant="h6" gutterBottom>
              Datos Principales del Curso
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CourseDetailsSection
                  formData={formData}
                  handleChange={handleChange}
                  bannerFile={bannerFile}
                  handleFileChange={handleFileChange}
                  uploadingBanner={uploadingBanner}
                  categorias={categorias}
                  loadingCategories={loadingCategories}
                  categoryErrorMessage={categoryErrorMessage}
                  isEditing={isEditing}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Columna Derecha (se adapta al 50% de ancho) */}
          <Box
            sx={{
              minWidth: { xs: "100%", md: "calc(50% - 1.5rem)" },
            }}
          >
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
          disabled={loading || uploadingBanner}
        >
          {loading || uploadingBanner ? (
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