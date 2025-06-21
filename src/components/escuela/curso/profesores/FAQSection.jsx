// FAQSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Collapse,
  Alert, // Agregado para mensajes de error/éxito
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const FAQSection = ({ courseId }) => {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [responseMessage, setResponseMessage] = useState({ type: '', message: '' }); // Para mensajes de la API

  useEffect(() => {
    // Función para limpiar mensajes después de un tiempo
    if (responseMessage.message) {
      const timer = setTimeout(() => {
        setResponseMessage({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  useEffect(() => {
    const fetchFAQs = async () => {
      if (!courseId) {
        setFaqs([]); // Limpiar FAQs si no hay courseId (ej. modo creación)
        return;
      }
      try {
        const response = await fetch(
          'https://apiacademy.hitpoly.com/ajax/getPreguntasYrespuestasController.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accion: 'getRespuestas', id: courseId }),
          }
        );
        const data = await response.json();
        if (data && data.status === "success" && data.items) {
          setFaqs(data.items);
        } else {
          setFaqs([]); // Si no hay datos o error, asegurar que el array esté vacío
          setResponseMessage({ type: 'warning', message: data.message || 'No se encontraron preguntas frecuentes para este curso.' });
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setResponseMessage({ type: 'error', message: 'Error al cargar las preguntas frecuentes.' });
        setFaqs([]);
      }
    };

    fetchFAQs();
  }, [courseId]); // Dependencia del courseId para recargar cuando cambie

  const handleAddFAQ = async () => {
    if (!courseId) {
        setResponseMessage({ type: 'error', message: 'Por favor, guarda el curso primero para añadir preguntas frecuentes.' });
        return;
    }
    if (newQuestion.trim() && newAnswer.trim()) {
      try {
        const response = await fetch(
          'https://apiacademy.hitpoly.com/ajax/cargarPreguntasyRespuestacontroller.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accion: 'preguntasYrespuestas',
              id: courseId,
              items: [{ pregunta: newQuestion.trim(), respuesta: newAnswer.trim() }],
            }),
          }
        );
        const data = await response.json();
        if (data.status === "success") {
          // Re-fetch para asegurar que el ID de la nueva pregunta sea el correcto
          // o asumiendo que la API devuelve la pregunta con su ID para añadirla
          // Por simplicidad, la añadimos directamente aquí, pero idealmente se re-fectchearía o la API devolvería el objeto completo
          setFaqs([...faqs, { pregunta: newQuestion.trim(), respuesta: newAnswer.trim() }]);
          setNewQuestion('');
          setNewAnswer('');
          setResponseMessage({ type: 'success', message: 'Pregunta frecuente añadida con éxito.' });
        } else {
          setResponseMessage({ type: 'error', message: data.message || 'Error al añadir la pregunta frecuente.' });
        }
      } catch (error) {
        console.error('Error adding FAQ:', error);
        setResponseMessage({ type: 'error', message: 'Error de red al añadir la pregunta frecuente.' });
      }
    } else {
      setResponseMessage({ type: 'warning', message: 'Por favor, ingresa tanto la pregunta como la respuesta.' });
    }
  };

  const handleDeleteFAQ = async (indexToDelete) => {
    // Para una eliminación real, necesitarías un endpoint de eliminación en tu API
    // que reciba el ID de la pregunta a eliminar, o el ID del curso y la pregunta misma.
    // Por ahora, solo la eliminaremos del estado local.
    const updatedFaqs = faqs.filter((_, index) => index !== indexToDelete);
    setFaqs(updatedFaqs);
    setResponseMessage({ type: 'info', message: 'Pregunta eliminada localmente. ¡Recuerda implementar la eliminación en la API!' });

    // TODO: Implementar la llamada a la API para eliminar la pregunta frecuente
    // Ejemplo (esto es un *placeholder*, adapta a tu API real):
    /*
    const faqIdToDelete = faqs[indexToDelete].id; // Asumiendo que cada FAQ tiene un 'id'
    try {
      const response = await fetch('https://apiacademy.hitpoly.com/ajax/deletePreguntasyRespuestasController.php', { // URL ficticia
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'delete', course_id: courseId, faq_id: faqIdToDelete }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setFaqs(updatedFaqs);
        setResponseMessage({ type: 'success', message: 'Pregunta frecuente eliminada con éxito.' });
      } else {
        setResponseMessage({ type: 'error', message: data.message || 'Error al eliminar la pregunta frecuente.' });
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      setResponseMessage({ type: 'error', message: 'Error de red al eliminar la pregunta frecuente.' });
    }
    */
  };

  const handleToggleExpand = (index) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  return (
    <Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Preguntas Frecuentes
      </Typography>

      {responseMessage.message && (
        <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
          {responseMessage.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Nueva Pregunta"
          variant="outlined"
          fullWidth
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          size="small"
          disabled={!courseId} // Deshabilitar si no hay ID de curso
        />
        <TextField
          label="Respuesta"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          size="small"
          disabled={!courseId} // Deshabilitar si no hay ID de curso
        />
        <Button
          onClick={handleAddFAQ}
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ alignSelf: 'flex-end', mt: 1 }}
          disabled={!courseId || !newQuestion.trim() || !newAnswer.trim()} // Deshabilitar si no hay ID de curso o campos vacíos
        >
          Añadir Pregunta
        </Button>
        {!courseId && (
            <Typography variant="caption" color="error">
                *Crea o edita un curso primero para añadir preguntas frecuentes.
            </Typography>
        )}
      </Box>

      {faqs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <List dense>
            {faqs.map((faq, index) => (
              <ListItem
                key={index} // Idealmente usar un ID único de la FAQ si lo devuelve la API
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteFAQ(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={faq.pregunta}
                  secondary={
                    <Collapse in={expandedFaqIndex === index} timeout="auto" unmountOnExit>
                      {faq.respuesta}
                    </Collapse>
                  }
                />
                <IconButton onClick={() => handleToggleExpand(index)}>
                  {expandedFaqIndex === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {faqs.length === 0 && courseId && ( // Solo muestra si hay courseId pero no FAQs
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Aún no hay preguntas frecuentes añadidas para este curso.
        </Typography>
      )}
    </Box>
  );
};

export default FAQSection;