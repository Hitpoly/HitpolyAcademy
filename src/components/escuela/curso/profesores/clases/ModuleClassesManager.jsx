// src/components/escuela/curso/components/clases/ModuleClassesManager.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  // Dialog, DialogTitle, DialogContent, DialogActions, IconButton, // Estas ya no son necesarias aquí
} from '@mui/material';
// import CloseIcon from "@mui/icons-material/Close"; // Ya no es necesaria aquí
import ClassCard from './ClassCard';
import ClassForm from './ClassForm';
import VideoPreviewModal from './VideoPreviewModal'; // ¡Importación del nuevo componente!

// Recibe la prop onBack para volver a la página anterior
const ModuleClassesManager = ({ onBack }) => {
  const { moduleId, courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const moduleTitle = location.state?.moduleTitle || 'Módulo Desconocido';
  const courseTitle = location.state?.courseTitle || 'Curso Desconocido';

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchClasses = async () => {
    if (!moduleId) {
      setLoading(false);
      setError("ID de módulo no proporcionado en la URL.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://apiacademy.hitpoly.com/ajax/traerTodasClasesController.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'getClases', modulo_id: moduleId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.clases)) {
        const filtered = data.clases.filter(
          (cls) => String(cls.modulo_id) === String(moduleId)
        );
        filtered.sort((a, b) => a.orden - b.orden);
        setClasses(filtered);
      } else {
        setError(
          data.message || 'Error al cargar las clases o formato de datos inesperado.'
        );
        setClasses([]);
      }
    } catch (err) {
      setError(`No se pudieron cargar las clases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [moduleId, refreshTrigger]);

  const handleAddClass = () => {
    setClassToEdit(null);
    setShowClassForm(true);
  };

  const handleEditClass = (classItem) => {
    setClassToEdit(classItem);
    setShowClassForm(true);
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://apiacademy.hitpoly.com/ajax/eliminarClasesController.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'delete', id: classId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        alert('Clase eliminada exitosamente.');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setError(data.message || 'Error al eliminar la clase.');
      }
    } catch (err) {
      setError(`No se pudo eliminar la clase: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClassFormClose = () => {
    setShowClassForm(false);
    setClassToEdit(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClassPreview = (classItem) => {
    if (classItem.url_video) {
      setPreviewUrl(classItem.url_video);
      setPreviewTitle(classItem.titulo);
      setShowPreviewModal(true);
    } else {
      alert('No hay URL de video/contenido para previsualizar.');
    }
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewUrl('');
    setPreviewTitle('');
  };

  const handleBackToModules = () => {
    navigate(`/cursos/${courseId}/modulos`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Cargando clases...
        </Typography>
      </Box>
    );
  }

  const existingClassOrders = classes.map((cls) => parseInt(cls.orden));

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #eee', mt: 2 }}>
      <Button variant="outlined" onClick={handleBackToModules} sx={{ mb: 2 }}>
        ← Volver a Módulos del Curso: **{courseTitle}**
      </Button>
      <Typography variant="h6" gutterBottom>
        Clases del Módulo: **{moduleTitle}**
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button variant="contained" onClick={handleAddClass} sx={{ mb: 3 }}>
        Añadir Nueva Clase
      </Button>

      <ClassForm
        moduleId={moduleId}
        classToEdit={classToEdit}
        open={showClassForm}
        onClose={handleClassFormClose}
        onClassSaved={handleClassFormClose}
        existingClassOrders={existingClassOrders}
      />

      {classes.length === 0 && !showClassForm ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No hay clases registradas para este módulo. ¡Añade una!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {classes.map((classItem) => (
            <Grid item key={classItem.id} xs={12} sx={{width: "100%"}}>
              <ClassCard
                classItem={classItem}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                onPreview={handleClassPreview}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Renderiza el Modal de Previsualización separado */}
      <VideoPreviewModal
        open={showPreviewModal}
        onClose={handleClosePreviewModal}
        videoUrl={previewUrl}
        videoTitle={previewTitle}
      />
    </Box>
  );
};

export default ModuleClassesManager;