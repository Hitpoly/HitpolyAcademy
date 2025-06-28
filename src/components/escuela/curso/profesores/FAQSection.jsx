import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  List, ListItem, ListItemText, CircularProgress, Alert,
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';

const FAQSection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [preguntasPendientes, setPreguntasPendientes] = useState([]);
  const [newPregunta, setNewPregunta] = useState('');
  const [newRespuesta, setNewRespuesta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Estados para la edición ---
  const [editingFaq, setEditingFaq] = useState(null); // Contiene la FAQ que se está editando
  const [editPregunta, setEditPregunta] = useState('');
  const [editRespuesta, setEditRespuesta] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false); // Controla la apertura del diálogo de edición

  const fetchFaqs = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      console.log("📦 Solicitando FAQs para curso:", id);

      const response = await fetch('https://apiacademy.hitpoly.com/ajax/getPreguntasYrespuestasController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getRespuestas', id }),
      });

      const rawText = await response.text();
      console.log("📨 Respuesta cruda del backend:", rawText);

      const data = JSON.parse(rawText);
      console.log("✅ Datos parseados:", data);

      if (data.status === 'success') {
        console.log("📋 FAQs obtenidas:", data.preguntasyrespuestas);
        // Asegúrate de que cada FAQ tenga un 'id' para la edición/eliminación
        setFaqs(data.preguntasyrespuestas.map(faq => ({ ...faq, id: faq.id || Math.random() })) || []);
      } else {
        console.warn("⚠️ Error de backend:", data.message);
        setError(data.message || 'No se pudieron cargar las FAQs.');
      }
    } catch (err) {
      console.error("❌ Error de red o parseo:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      fetchFaqs(courseId);
    } else {
      console.warn("⚠️ No se recibió courseId desde useParams.");
    }
  }, [courseId, fetchFaqs]);

  const handleAddToList = () => {
    if (!newPregunta.trim() || !newRespuesta.trim()) {
      setError('Por favor, rellena la pregunta y la respuesta.');
      return;
    }

    setPreguntasPendientes(prev => [
      ...prev,
      { pregunta: newPregunta.trim(), respuesta: newRespuesta.trim() }
    ]);
    setNewPregunta('');
    setNewRespuesta('');
    setError('');
  };

  const handleSubmitAll = async () => {
    if (preguntasPendientes.length === 0) {
      setError('No hay preguntas nuevas para enviar.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log("🚀 Enviando preguntas nuevas:", preguntasPendientes);

      const response = await fetch('https://apiacademy.hitpoly.com/ajax/cargarPreguntasyRespuestacontroller.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'preguntasYrespuestas',
          id: courseId, // Asegúrate de que el backend espere 'id' como id_curso
          items: preguntasPendientes,
        }),
      });

      const rawText = await response.text();
      console.log("📨 Respuesta cruda al enviar preguntas:", rawText);

      const data = JSON.parse(rawText);
      console.log("✅ Resultado envío:", data);

      if (data.status === 'success') {
        Swal.fire('¡Enviado!', 'Preguntas frecuentes guardadas exitosamente.', 'success');
        setPreguntasPendientes([]); // Limpiar preguntas pendientes
        fetchFaqs(courseId); // Recargar las FAQs para ver las nuevas
      } else {
        console.warn("⚠️ Error al guardar:", data.message);
        setError(data.message || 'Error al guardar las preguntas.');
      }
    } catch (err) {
      console.error("❌ Error al enviar preguntas:", err);
      setError(`Error al enviar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Funciones para la edición ---
  const handleOpenEditDialog = (faq) => {
    setEditingFaq(faq);
    setEditPregunta(faq.pregunta);
    setEditRespuesta(faq.respuesta);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingFaq(null);
    setEditPregunta('');
    setEditRespuesta('');
    setError('');
  };

  const handleUpdateFaq = async () => {
    if (!editPregunta.trim() || !editRespuesta.trim()) {
      setError('La pregunta y la respuesta no pueden estar vacías.');
      return;
    }

    if (!editingFaq || !editingFaq.id) {
      setError('Error: ID de FAQ no encontrado para la edición.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log("🛠️ Editando FAQ con ID:", editingFaq.id);
      const response = await fetch('https://apiacademy.hitpoly.com/ajax/editarPreguntasYrespuestasController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'update',
          id: editingFaq.id, // ID de la pregunta/respuesta
          id_curso: courseId, // ID del curso
          pregunta: editPregunta.trim(),
          respuesta: editRespuesta.trim(),
        }),
      });

      const data = await response.json();
      console.log("✅ Resultado edición:", data);

      if (data.status === 'success') {
        Swal.fire('¡Actualizado!', 'Pregunta frecuente actualizada exitosamente.', 'success');
        setOpenEditDialog(false);
        fetchFaqs(courseId); // Recargar las FAQs para ver el cambio
      } else {
        console.warn("⚠️ Error al actualizar:", data.message);
        setError(data.message || 'Error al actualizar la pregunta.');
      }
    } catch (err) {
      console.error("❌ Error al actualizar FAQ:", err);
      setError(`Error de red o servidor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ELIMINADAS FUNCIONES DE ELIMINACIÓN Y BOTONES ASOCIADOS
  // const handleDeleteFaq = async (faqId) => { ... }


  const handleBackToEdit = () => navigate(-1);
  const handleBackToCourses = () => navigate('/mis-cursos');

  if (!courseId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        ID de curso no proporcionado. No se pueden gestionar las preguntas frecuentes.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', backgroundColor: 'white', boxShadow: 3, borderRadius: '8px' }}>

      {/* Botones de navegación superiores */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleBackToEdit}>
          ← Formulario del curso
        </Button>
        <Button variant="outlined" color="primary" onClick={handleBackToCourses}>
          ← Volver a Mis Cursos
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom align="center">
        Preguntas Frecuentes del Curso {courseId}
      </Typography>

      {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && faqs.length === 0 && preguntasPendientes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Este curso aún no tiene preguntas frecuentes registradas. Puedes añadir nuevas abajo.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Añadir Nueva Pregunta Frecuente
        </Typography>
        <TextField
          label="Pregunta"
          fullWidth
          margin="normal"
          value={newPregunta}
          onChange={(e) => setNewPregunta(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Respuesta"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={newRespuesta}
          onChange={(e) => setNewRespuesta(e.target.value)}
          disabled={loading}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddToList}
          sx={{ mt: 1 }}
          disabled={loading || openEditDialog} // Deshabilitar si se está editando o cargando
        >
          Agregar a la lista
        </Button>

        {preguntasPendientes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preguntas a enviar: {preguntasPendientes.length}
            </Typography>
            <List dense>
              {preguntasPendientes.map((item, index) => (
                <ListItem key={`nueva-${index}`} secondaryAction={
                    // Botón de eliminar para preguntas pendientes
                    <IconButton edge="end" aria-label="delete" onClick={() => setPreguntasPendientes(prev => prev.filter((_, i) => i !== index))}>
                        {/* Se mantiene este ícono para eliminar de la lista *pendiente*, no del backend */}
                        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                        <img src={require('@mui/icons-material/Delete').default} alt="Delete" style={{ width: 24, height: 24 }} />
                    </IconButton>
                }>
                  <ListItemText
                    primary={`P: ${item.pregunta}`}
                    secondary={`R: ${item.respuesta}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitAll}
              disabled={loading || openEditDialog} // Deshabilitar si se está editando o cargando
            >
              Enviar todas las nuevas FAQs
            </Button>
          </Box>
        )}
      </Box>

      {faqs.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            FAQs Existentes ({faqs.length})
          </Typography>
          <List dense>
            {faqs.map((faq) => (
              <ListItem
                key={faq.id} // Usar el ID real de la FAQ para la clave
                sx={{ borderBottom: '1px dashed #eee', alignItems: 'flex-start', py: 1 }}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(faq)} disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    {/* Botón de eliminar FAQ de las existentes ELIMINADO */}
                    {/* <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFaq(faq.id)} disabled={loading}>
                      <DeleteIcon />
                    </IconButton> */}
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography variant="subtitle2">P: {faq.pregunta}</Typography>}
                  secondary={<Typography variant="body2" color="text.secondary">R: {faq.respuesta}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Diálogo de Edición */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Editar Pregunta Frecuente
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Pregunta"
            fullWidth
            margin="normal"
            value={editPregunta}
            onChange={(e) => setEditPregunta(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Respuesta"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editRespuesta}
            onChange={(e) => setEditRespuesta(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateFaq}
            color="primary"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQSection;