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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Swal from "sweetalert2"; 
import { useAuth } from "../../../../../context/AuthContext";


const API_GET_PREGUNTAS = "https://apiacademy.hitpoly.com/ajax/getPregExamenController.php";
const API_GUARDAR_RESULTADO = "https://apiacademy.hitpoly.com/ajax/resultadoExamenController.php";
const API_GET_EXAMENES = "https://apiacademy.hitpoly.com/ajax/getExamenController.php";


const parseJsonSafe = (str) => {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch (e) {
    return str || [];
  }
};

const ExamenAlumno = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [examCoverImage, setExamCoverImage] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!examId) {
        setError("No se proporcionó un ID de examen.");
        setLoading(false);
        return;
      }

      try {
        const examResponse = await axios.post(API_GET_EXAMENES, { accion: "getExamen" });
        if (examResponse.data.status === "success" && examResponse.data.examenes) {
          const currentExam = examResponse.data.examenes.find(
            (e) => String(e.id) === String(examId)
          );
          if (currentExam) {
            setExamTitle(currentExam.titulo);
            setExamDescription(currentExam.descripcion);
            setExamCoverImage(currentExam.imagen_portada);
          } else {
            throw new Error("No se encontró la información del examen.");
          }
        } else {
          throw new Error("Error al cargar la información del examen.");
        }

        const questionsResponse = await axios.post(API_GET_PREGUNTAS, { accion: "get" });
        if (
          questionsResponse.data.status === "success" &&
          questionsResponse.data.preguntasYrespuestas
        ) {
          const examQuestions = questionsResponse.data.preguntasYrespuestas.filter(
            (q) => String(q.examen_id) === String(examId)
          );

          if (examQuestions.length > 0) {
            const formattedQuestions = examQuestions.map((q) => ({
              ...q,
              opciones: parseJsonSafe(q.opciones),
              respuesta_correcta: Array.isArray(
                parseJsonSafe(q.respuesta_correcta)
              )
                ? parseJsonSafe(q.respuesta_correcta)[0]
                : parseJsonSafe(q.respuesta_correcta),
            }));
            setQuestions(formattedQuestions);
          } else {
            setError("No se encontraron preguntas para este examen.");
          }
        } else {
          throw new Error("Error al cargar las preguntas.");
        }
      } catch (err) {
        setError(err.message || "Ocurrió un error al cargar el examen.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    const allQuestionsAnswered = questions.every(
      (q) => userAnswers[q.id] !== undefined
    );
    if (!allQuestionsAnswered) {
      Swal.fire({
        icon: "warning",
        title: "Faltan preguntas por responder",
        text: "Por favor, responde todas las preguntas antes de enviar el examen.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      let correctAnswersCount = 0;
      const formattedAnswers = questions.map((q) => {
        if (userAnswers[q.id] === q.respuesta_correcta) {
          correctAnswersCount++;
        }
        return {
          pregunta_id: parseInt(q.id),
          respuesta_usuario: userAnswers[q.id],
        };
      });
      const score = Math.round((correctAnswersCount / questions.length) * 100);

      const payload = {
        accion: "guardarResultado",
        examen_id: parseInt(examId),
        usuario_id: user.id,
        puntaje: score,
        respuestas: formattedAnswers,
        fecha_envio: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      const response = await axios.post(API_GUARDAR_RESULTADO, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status !== "success") {
        throw new Error(response.data.message || "Error al guardar el resultado.");
      }
      
      navigate(`/cursos/${courseId}/examen/${examId}/resultados`);

    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al enviar tus respuestas. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Cargando examen...
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {examCoverImage && (
          <Box
            sx={{
              m: -4,
              mb: 4,
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <img
              src={examCoverImage}
              alt={examTitle}
              style={{
                width: "100%",
                height: "250px",
                borderRadius: "8px 8px 0px 0px",
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: "1.8rem" }}>
          {examTitle || "Cargando..."}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          {examDescription || "Responde cada pregunta y luego envía tu examen."}
        </Typography>

        {questions.map((q, index) => (
          <Paper key={q.id} sx={{ mb: 4, p: 2, border: '1px solid #ccc' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'normal' }}>
              {index + 1}. {q.texto_pregunta}
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label={q.texto_pregunta}
                name={`question-${q.id}`}
                value={userAnswers[q.id] || ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              >
                {q.opciones.map((opcion, i) => {
                  const letra = String.fromCharCode(65 + i); // 65 es el código ASCII para 'A'
                  return (
                    <FormControlLabel
                      key={opcion.opcion}
                      value={opcion.opcion}
                      control={<Radio />}
                      label={`${letra}. ${opcion.texto}`}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Paper>
        ))}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSubmitting ? "Enviando..." : "Enviar Examen"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExamenAlumno;