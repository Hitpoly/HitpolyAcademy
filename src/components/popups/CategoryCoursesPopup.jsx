// components/popups/CategoryCoursesPopup.jsx
import React, { useEffect } from 'react'; // Importa useEffect
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CourseCategory from '../categorias/CourseCategory';

const CategoryCoursesPopup = ({
  isOpen,
  onClose,
  selectedCategoryId,
  categoryMap,
  allCourses,
  loading,
  error
}) => {

  useEffect(() => {
    if (isOpen) {}
  }, [isOpen, selectedCategoryId, allCourses, categoryMap, loading, error]);


  const categoryTitle = selectedCategoryId ? categoryMap[selectedCategoryId] : "Todos los Cursos";

  const coursesToShow = selectedCategoryId
    ? allCourses.filter(course => String(course.categoria_id) === String(selectedCategoryId))
    : allCourses;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Cursos en {categoryTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando cursos...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Error al cargar los cursos: {error}
          </Alert>
        ) : coursesToShow.length === 0 && selectedCategoryId !== null ? (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ p: 3 }}>
            No hay cursos disponibles para esta categoría.
          </Typography>
        ) : (
          <CourseCategory
            courses={coursesToShow}
            categoryMap={categoryMap}
            loading={false}
            error={null}
            selectedCategoryId={selectedCategoryId} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCoursesPopup;