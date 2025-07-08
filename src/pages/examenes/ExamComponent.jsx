import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';

import { allExams } from './data/questionsData';

const ExamComponent = () => {
  const { examName } = useParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [examData, setExamData] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setExamData(null);
    setHasError(false);
    setAnswers({});

    if (examName && allExams[examName]) {
      setExamData(allExams[examName]);
    } else {
      setHasError(true);
    }
  }, [examName]);

  if (hasError) {
    return (
      <Box sx={{
        p: 4,
        textAlign: 'center',
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        <Alert severity="error">
          <Typography variant="h6">
            Examen no encontrado. Por favor, verifica el nombre del examen en la URL.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Volver a la Página Principal
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!examData) {
    return null;
  }

  const { title: examTitle, description: examDescription, rules: examRules, questions } = examData;

  const answeredQuestionsCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (answeredQuestionsCount / totalQuestions) * 100 : 0;

  const handleAnswerChange = (questionId, event) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: event.target.value,
    }));
  };

  const handleSubmitExam = () => {
    const results = questions.map((question) => {
      const selectedAnswerId = answers[question.id] || null;
      const isCorrect = selectedAnswerId === question.correctAnswerId;
      return {
        questionId: question.id,
        questionText: question.questionText,
        selectedAnswerId: selectedAnswerId,
        correctAnswerId: question.correctAnswerId,
        isCorrect: isCorrect,
        options: question.options,
        explanation: question.explanation,
      };
    });
    navigate('/exam-results', { state: { answers: results, questions, examTitle } });
  };

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{
        p: 4,
        textAlign: 'center',
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        <Alert severity="warning">
          <Typography>No hay preguntas disponibles para este examen.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Volver a la Página Principal
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: 'calc(100vh - 65px)',
        p: 2,
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          width: '100%',
          maxWidth: '800px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          sx={{
            mb: 2,
            py: 15, 
            color: 'white', 
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
            backgroundImage: `url("/images/setters.jpg")`, 
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 1,
          }}
        >
          {examTitle}
        </Typography>

        {examDescription && (
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            {examDescription}
          </Typography>
        )}

        {examRules && examRules.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Reglas del Examen
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 3 }}>
              {examRules.map((rule, index) => (
                <Typography component="li" key={index} variant="body1">
                  {rule}
                </Typography>
              ))}
            </Box>
          </>
        )}

        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="right" sx={{ mb: 2 }}>
          Preguntas contestadas: {answeredQuestionsCount} de {totalQuestions}
        </Typography>

        {questions.map((question, index) => (
          <FormControl key={question.id} component="fieldset" fullWidth sx={{ mb: 4 }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              <Typography variant="h6">
                {index + 1}. {question.questionText}
              </Typography>
            </FormLabel>
            <RadioGroup
              name={`question-${question.id}`}
              value={answers[question.id] || ''}
              onChange={(event) => handleAnswerChange(question.id, event)}
            >
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                />
              ))}
            </RadioGroup>
          </FormControl>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitExam}
          fullWidth
          sx={{ mt: 'auto', mb: 1 }}
        >
          Finalizar Examen
        </Button>
      </Paper>
    </Box>
  );
};

export default ExamComponent;