import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";

const API_GET_PREGUNTAS =
  "https://apiacademy.hitpoly.com/ajax/getPregExamenController.php";
const API_GET_RESULTADOS =
  "https://apiacademy.hitpoly.com/ajax/getResultadosController.php";

const ResultadosAlumno = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [examQuestions, setExamQuestions] = useState([]);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculatedScore, setRecalculatedScore] = useState(0);

  const parseJsonSafe = (str) => {
    try {
      const parsed = JSON.parse(str);
      return parsed;
    } catch (e) {
      return str || [];
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!examId || !user?.id) {
        setError("Faltan datos de examen o de usuario.");
        setLoading(false);
        return;
      }
      try {
        const [questionsResponse, resultsResponse] = await Promise.all([
          axios.post(API_GET_PREGUNTAS, { accion: "get" }),
          axios.post(API_GET_RESULTADOS, { accion: "get" }),
        ]);

        if (
          !resultsResponse.data ||
          resultsResponse.data.status !== "success" ||
          !Array.isArray(resultsResponse.data.notas)
        ) {
          setError("Error al cargar los resultados o formato de datos incorrecto.");
          setLoading(false);
          return;
        }

        const userNotesForExam = resultsResponse.data.notas.filter(
          (r) =>
            String(r.examen_id) === String(examId) &&
            String(r.usuario_id) === String(user.id)
        );

        const latestNote = userNotesForExam.sort(
          (a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio)
        )[0];

        if (!latestNote) {
          setError("No se encontraron resultados para este examen.");
          setLoading(false);
          return;
        }

        const formattedResult = {
          ...latestNote,
          respuestas: parseJsonSafe(latestNote.respuestas),
        };
        setResultData(formattedResult);

        // --- FIN DEL CAMBIO ---

        if (
          !questionsResponse.data ||
          questionsResponse.data.status !== "success" ||
          !Array.isArray(questionsResponse.data.preguntasYrespuestas)
        ) {
          throw new Error(
            "Error al cargar las preguntas o formato de datos incorrecto."
          );
        }

        const foundQuestions = questionsResponse.data.preguntasYrespuestas
          .filter((q) => String(q.examen_id) === String(examId))
          .map((q) => ({
            ...q,
            opciones: parseJsonSafe(q.opciones),
            respuesta_correcta: Array.isArray(
              parseJsonSafe(q.respuesta_correcta)
            )
              ? parseJsonSafe(q.respuesta_correcta)[0]
              : parseJsonSafe(q.respuesta_correcta),
          }));

        setExamQuestions(foundQuestions);

        if (foundQuestions.length > 0 && formattedResult.respuestas) {
          let correctAnswersCount = 0;
          for (const q of foundQuestions) {
            const userAnswerEntry = formattedResult.respuestas.find(
              (r) => String(r.pregunta_id) === String(q.id)
            );
            
            let userAnswer = "No respondida";
            if (userAnswerEntry) {
                userAnswer = userAnswerEntry.respuesta_usuario;
                if (Array.isArray(userAnswer)) {
                    userAnswer = userAnswer[0];
                }
            }

            if (userAnswer === q.respuesta_correcta) {
              correctAnswersCount++;
            }
          }
          const newScore = Math.round(
            (correctAnswersCount / foundQuestions.length) * 100
          );
          setRecalculatedScore(newScore);
          } else {
          setRecalculatedScore(0);
          }
      } catch (err) {
        setError(
          err.message || "Ocurrió un error al cargar los resultados del examen."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [examId, user]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando tus resultados...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!resultData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          Aún no has rendido este examen. Por favor, ve al examen y complétalo.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  const isApproved = recalculatedScore >= 49;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Resultados del Examen
        </Typography>
        <Box sx={{ my: 4, textAlign: "center" }}>
          <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
            Tu Puntaje Final: {recalculatedScore}%
          </Typography>
          <Typography
            variant="body1"
            color={isApproved ? "success.main" : "error.main"}
            sx={{ fontWeight: "bold" }}
          >
            {isApproved
              ? "¡Felicidades, has aprobado!"
              : "Necesitas repasar, has desaprobado."}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Revisión de Respuestas
        </Typography>
        {examQuestions.map((q, index) => {
          const userAnswerEntry = resultData.respuestas.find(
            (r) => String(r.pregunta_id) === String(q.id)
          );
          
          let userAnswer = "No respondida";
          if (userAnswerEntry) {
              userAnswer = userAnswerEntry.respuesta_usuario;
              if (Array.isArray(userAnswer)) {
                  userAnswer = userAnswer[0];
              }
          }
          
          const isCorrect = userAnswer === q.respuesta_correcta;
          const userHasAnswered = userAnswer !== "No respondida";

          return (
            <Box
              key={q.id}
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid",
                borderColor: isCorrect ? "success.main" : "error.main",
                borderRadius: 1,
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {index + 1}. {q.texto_pregunta}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      isCorrect ? "success.main" : userHasAnswered ? "error.main" : "text.secondary"
                    }
                    sx={{ mt: 1 }}
                  >
                    Tu respuesta: {userAnswer}
                    {userHasAnswered ? (
                      isCorrect ? (
                        <CheckCircleIcon
                          sx={{ verticalAlign: "middle", ml: 1 }}
                        />
                      ) : (
                        <CancelIcon sx={{ verticalAlign: "middle", ml: 1 }} />
                      )
                    ) : null}
                  </Typography>
                  {!isCorrect && (
                    <Typography variant="body2" color="success.main">
                      Respuesta correcta: {q.respuesta_correcta}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Explicación: {q.explicacion}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          );
        })}
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 4 }}
        >
          Volver a Módulos
        </Button>
      </Paper>
    </Container>
  );
};

export default ResultadosAlumno;