// src/components/ExamResults.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // <-- Aquí se desestructura el examTitle del estado de la navegación
  const { answers, questions, examTitle = "Examen" } = location.state || { answers: [], questions: [], examTitle: "Examen" };

  if (!answers || answers.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No hay resultados de examen disponibles.</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')} // O la ruta a tu página de inicio/exámenes
          sx={{ mt: 3 }}
        >
          Volver a la Página Principal
        </Button>
      </Box>
    );
  }

  const score = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = (totalQuestions > 0) ? (score / totalQuestions) * 100 : 0; // Evita división por cero

  const wrongAnswers = answers.filter((answer) => !answer.isCorrect);

  const getOptionText = (questionOptions, optionId) => {
    const option = questionOptions.find(opt => opt.id === optionId);
    return option ? option.text : 'N/A';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 800, width: '100%', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
          Resultados de {examTitle} {/* <-- Título del examen dinámico aquí */}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            Puntuación:
          </Typography>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
            {score} / {totalQuestions}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            ({percentage.toFixed(2)}%)
          </Typography>
        </Box>

        {wrongAnswers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom color="error">
              Respuestas Fallidas:
            </Typography>
            <List>
              {wrongAnswers.map((answeredQuestion) => (
                <Paper key={answeredQuestion.questionId} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Pregunta: {answeredQuestion.questionText}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="error">
                            Tu respuesta: {getOptionText(answeredQuestion.options, answeredQuestion.selectedAnswerId)}
                            <CancelOutlinedIcon sx={{ fontSize: 'small', verticalAlign: 'middle', ml: 0.5 }} />
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            Respuesta correcta: {getOptionText(answeredQuestion.options, answeredQuestion.correctAnswerId)}
                            <CheckCircleOutlineIcon sx={{ fontSize: 'small', verticalAlign: 'middle', ml: 0.5 }} />
                          </Typography>
                          {answeredQuestion.explanation && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              Explicación: {answeredQuestion.explanation}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Box>
        )}

        {wrongAnswers.length === 0 && (
          <Typography variant="h6" color="success.main" align="center" sx={{ mt: 4 }}>
            ¡Felicidades! Has respondido correctamente todas las preguntas.
          </Typography>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')} // O la ruta a tu página de inicio/exámenes
          >
            Volver al Inicio
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExamResults;