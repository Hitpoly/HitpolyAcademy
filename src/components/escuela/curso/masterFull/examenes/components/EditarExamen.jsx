import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Grid,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../../../context/AuthContext";

const API_GET_EXAMEN =
  "https://apiacademy.hitpoly.com/ajax/getExamenController.php";
const API_EDITAR_EXAMEN =
  "https://apiacademy.hitpoly.com/ajax/editarExamenController.php";
const API_GET_PREGUNTAS =
  "https://apiacademy.hitpoly.com/ajax/getPregExamenController.php";
const API_EDITAR_PREGUNTA =
  "https://apiacademy.hitpoly.com/ajax/editPreguntRespController.php";
const API_CARGAR_PREGUNTAS =
  "https://apiacademy.hitpoly.com/ajax/preguntasExamenController.php";
const CLOUDINARY_API_URL =
  "https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php";
const API_GET_CURSOS =
  "https://apiacademy.hitpoly.com/ajax/traerCursosController.php"; // <--- Nueva API para obtener el nombre del curso
const API_ELIMINAR_PREGUNTA =
  "https://apiacademy.hitpoly.com/ajax/eliminarPregYrespController.php";

const parseJsonSafe = (str) => {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch (e) {
    return str || [];
  }
};

const EditarExamen = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    id: null,
    titulo: "",
    descripcion: "",
    creado_por: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    texto_pregunta: "",
    opciones: [{ opcion: "A", texto: "" }],
    respuesta_correcta: "",
    explicacion: "",
    id: null,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [courseName, setCourseName] = useState(""); // <-- Nuevo estado para el nombre del curso
  const [isLoadingCourse, setIsLoadingCourse] = useState(true); // <-- Nuevo estado de carga

  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  const uploadImage = async (file) => {
    const formDataImg = new FormData();
    formDataImg.append("file", file);

    try {
      setIsUploading(true);
      const response = await axios.post(CLOUDINARY_API_URL, formDataImg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.url) {
        return response.data.url;
      } else {
        throw new Error("No se recibió una URL válida de la subida de imagen.");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "Ocurrió un error al intentar subir la imagen. Por favor, inténtalo de nuevo.",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      texto_pregunta: "",
      opciones: [{ opcion: "A", texto: "" }],
      respuesta_correcta: "",
      explicacion: "",
      id: null,
    });
    setEditingIndex(null);
    setError("");
  };

  // useEffect para cargar el nombre del curso
  useEffect(() => {
    const fetchCourseName = async () => {
      if (!courseId) {
        setError("No se proporcionó un ID de curso.");
        setIsLoadingCourse(false);
        return;
      }
      try {
        const response = await fetch(API_GET_CURSOS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getCursos", id: null }),
        });
        const data = await response.json();
        if (data.status === "success" && data.cursos && data.cursos.cursos) {
          const coursesArray = data.cursos.cursos;
          const foundCourse = coursesArray.find(
            (curso) => String(curso.id) === String(courseId)
          );
          if (foundCourse) {
            setCourseName(foundCourse.titulo);
          } else {
            setError("Curso no encontrado.");
          }
        } else {
          setError("Error al cargar la información del curso.");
        }
      } catch (err) {
        console.error("Error en la llamada a la API:", err);
        setError("Error de red al obtener el nombre del curso.");
      } finally {
        setIsLoadingCourse(false);
      }
    };
    fetchCourseName();
  }, [courseId]);

  // useEffect para cargar los datos del examen y las preguntas
  useEffect(() => {
    const fetchData = async () => {
      if (!examId) {
        setError("No se proporcionó un ID de examen para editar.");
        setLoading(false);
        return;
      }

      try {
        const [examResponse, questionsResponse] = await Promise.all([
          axios.post(API_GET_EXAMEN, { accion: "getExamen" }),
          axios.post(API_GET_PREGUNTAS, { accion: "get" }),
        ]);

        if (
          examResponse.data.status !== "success" ||
          !examResponse.data.examenes
        ) {
          throw new Error("Error al cargar los datos del examen principal.");
        }
        const foundExam = examResponse.data.examenes.find(
          (exam) => String(exam.id) === String(examId)
        );
        if (!foundExam) {
          throw new Error("Examen no encontrado.");
        }
        setFormData({
          id: foundExam.id,
          titulo: foundExam.titulo || "",
          descripcion: foundExam.descripcion || "",
          creado_por: foundExam.creado_por,
        });
        setImageUrl(foundExam.imagen_portada || "");

        if (
          questionsResponse.data.status === "success" &&
          questionsResponse.data.preguntasYrespuestas
        ) {
          const examQuestions =
            questionsResponse.data.preguntasYrespuestas.filter(
              (q) => String(q.examen_id) === String(examId)
            );

          setQuestions(
            examQuestions.map((q) => {
              const parsedOptions = parseJsonSafe(q.opciones);
              const parsedCorrectAnswer = Array.isArray(
                parseJsonSafe(q.respuesta_correcta)
              )
                ? parseJsonSafe(q.respuesta_correcta)[0]
                : parseJsonSafe(q.respuesta_correcta);

              return {
                ...q,
                opciones: parsedOptions,
                respuesta_correcta: parsedCorrectAnswer,
              };
            })
          );
        }
      } catch (err) {
        setError(
          err.message || "Examen no encontrado o formato de datos incorrecto."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...currentQuestion.opciones];
    newOptions[index].texto = e.target.value;
    setCurrentQuestion((prev) => ({ ...prev, opciones: newOptions }));
  };

  const handleCorrectAnswerChange = (e) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      respuesta_correcta: e.target.value,
    }));
  };

  const addOption = () => {
    if (currentQuestion.opciones.length >= 4) {
      setError("Solo se pueden agregar hasta 4 opciones.");
      return;
    }
    const newOptions = [
      ...currentQuestion.opciones,
      {
        opcion: String.fromCharCode(65 + currentQuestion.opciones.length),
        texto: "",
      },
    ];
    setCurrentQuestion((prev) => ({ ...prev, opciones: newOptions }));
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.opciones.filter((_, i) => i !== index);
    const reindexedOptions = newOptions.map((opt, i) => ({
      ...opt,
      opcion: String.fromCharCode(65 + i),
    }));
    setCurrentQuestion((prev) => ({
      ...prev,
      opciones: reindexedOptions,
      respuesta_correcta:
        prev.respuesta_correcta === prev.opciones[index].opcion
          ? ""
          : prev.respuesta_correcta,
    }));
  };

  const handleAddOrUpdateQuestion = () => {
    const hasValidOptions = currentQuestion.opciones.every(
      (opt) => opt.texto.trim() !== ""
    );
    if (
      !currentQuestion.texto_pregunta ||
      !currentQuestion.respuesta_correcta ||
      !hasValidOptions ||
      currentQuestion.opciones.length < 2
    ) {
      setError(
        "Por favor, completa el texto de la pregunta, al menos 2 opciones válidas y selecciona una respuesta correcta."
      );
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
    } else {
      setQuestions((prev) => [...prev, { ...currentQuestion, id: null }]);
    }
    resetCurrentQuestion();
  };

  const editQuestion = (index) => {
    const questionToEdit = questions[index];
    if (!questionToEdit) return;

    const parsedOptions = Array.isArray(questionToEdit.opciones)
      ? questionToEdit.opciones
      : parseJsonSafe(questionToEdit.opciones);

    const parsedCorrectAnswer = Array.isArray(
      parseJsonSafe(questionToEdit.respuesta_correcta)
    )
      ? parseJsonSafe(questionToEdit.respuesta_correcta)[0]
      : parseJsonSafe(questionToEdit.respuesta_correcta);

    const newCurrentQuestion = {
      ...questionToEdit,
      opciones: parsedOptions,
      respuesta_correcta: parsedCorrectAnswer,
    };
    setCurrentQuestion(newCurrentQuestion);
    setEditingIndex(index);
    setError("");
  };

  const deleteQuestion = async (index) => {
    const questionToDelete = questions[index];

    if (questionToDelete.id) {
      setDeletingQuestionId(questionToDelete.id);
      try {
        const response = await axios.post(
          API_ELIMINAR_PREGUNTA,
          { accion: "delete", id: questionToDelete.id },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status !== "success") {
          throw new Error(
            response.data.message ||
              "Error al eliminar la pregunta en el servidor."
          );
        }

        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        if (editingIndex === index) {
          resetCurrentQuestion();
        } else if (editingIndex > index) {
          setEditingIndex(editingIndex - 1);
        }
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || "Hubo un problema al intentar eliminar la pregunta.",
          "error"
        );
      } finally {
        setDeletingQuestionId(null);
      }
    } else {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      if (editingIndex === index) {
        resetCurrentQuestion();
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    if (!formData.titulo || !formData.descripcion) {
      setError("El título y la descripción del examen son obligatorios.");
      setSaving(false);
      return;
    }
    if (questions.length === 0) {
      setError("Debe agregar al menos una pregunta al examen.");
      setSaving(false);
      return;
    }

    let finalImageUrl = imageUrl;
    if (selectedFile) {
      finalImageUrl = await uploadImage(selectedFile);
      if (!finalImageUrl) {
        setSaving(false);
        return;
      }
    }

    if (!finalImageUrl) {
      setError("La imagen de portada es obligatoria.");
      setSaving(false);
      return;
    }

    try {
      const examPayload = {
        accion: "updateExamen",
        id: formData.id,
        curso_id: parseInt(courseId, 10),
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        imagen_portada: finalImageUrl,
        creado_por: user?.id || null,
      };

      const examResponse = await axios.post(API_EDITAR_EXAMEN, examPayload, {
        headers: { "Content-Type": "application/json" },
      });
      if (examResponse.data.status !== "success") {
        throw new Error(
          examResponse.data.message || "Error al editar el examen."
        );
      }

      const questionPromises = questions.map(async (question) => {
        const optionsToSend = question.opciones;
        const finalCorrectAnswer = [question.respuesta_correcta];

        const basePayload = {
          examen_id: formData.id,
          texto_pregunta: question.texto_pregunta,
          opciones: optionsToSend,
          respuesta_correcta: finalCorrectAnswer,
          explicacion: question.explicacion,
          fecha_creacion: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        };

        if (question.id) {
          const fullPayload = {
            ...basePayload,
            accion: "edit",
            id: question.id,
          };
          const response = await axios.post(API_EDITAR_PREGUNTA, fullPayload, {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          const newQuestionPayload = {
            ...basePayload,
            accion: "preguntasExamen",
          };
          const response = await axios.post(
            API_CARGAR_PREGUNTAS,
            newQuestionPayload,
            { headers: { "Content-Type": "application/json" } }
          );
        }
      });

      await Promise.all(questionPromises);

      setSuccess("¡Examen y preguntas actualizados con éxito! Redirigiendo...");
      setTimeout(() => {
        navigate(`/cursos/${courseId}/modulos`);
      }, 2000);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al actualizar el examen y/o las preguntas."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoadingCourse) {
    // <-- Se verifica ambos estados de carga
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
          {isLoadingCourse
            ? "Cargando información del curso..."
            : "Cargando datos del examen..."}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Editar Examen del Curso:{" "}
          <span style={{ fontWeight: "bold" }}>{courseName}</span>
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Datos del Examen
          </Typography>
          <TextField
            fullWidth
            required
            id="titulo"
            name="titulo"
            label="Título del Examen"
            value={formData.titulo}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            required
            id="descripcion"
            name="descripcion"
            label="Descripción del Examen"
            multiline
            rows={4}
            value={formData.descripcion}
            onChange={handleChange}
          />
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              disabled={isUploading || saving}
            >
              {isUploading ? (
                <CircularProgress size={24} />
              ) : (
                "Seleccionar nueva Imagen"
              )}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
            {(selectedFile || imageUrl) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Previsualización de la Imagen:
                </Typography>
                <img
                  src={
                    selectedFile ? URL.createObjectURL(selectedFile) : imageUrl
                  }
                  alt="Vista previa"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "250px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>

          <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
            Preguntas y Respuestas
          </Typography>

          {questions.map((q, qIndex) => (
            <React.Fragment key={q.id || `new-${qIndex}`}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft:
                    editingIndex === qIndex
                      ? "4px solid #1976d2"
                      : "4px solid #4caf50",
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs>
                    <Typography variant="subtitle1" gutterBottom>
                      Pregunta {qIndex + 1}: {q.texto_pregunta}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Respuesta Correcta: {q.respuesta_correcta || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => editQuestion(qIndex)}
                      color="primary"
                      size="small"
                      disabled={saving || isUploading || deletingQuestionId}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteQuestion(qIndex)}
                      color="error"
                      size="small"
                      disabled={
                        saving ||
                        isUploading ||
                        // Esta es la parte clave, solo se evalúa la carga si la pregunta tiene un ID
                        (q.id && deletingQuestionId === q.id)
                      }
                    >
                      {q.id && deletingQuestionId === q.id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </React.Fragment>
          ))}

          <Paper
            elevation={2}
            sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="h6">
              {editingIndex !== null
                ? "Editando Pregunta"
                : "Agregar Nueva Pregunta"}
            </Typography>
            <TextField
              fullWidth
              label="Texto de la Pregunta"
              name="texto_pregunta"
              value={currentQuestion.texto_pregunta}
              onChange={handleQuestionChange}
            />
            {currentQuestion.opciones.map((option, oIndex) => (
              <Box
                key={oIndex}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography>{option.opcion}.</Typography>
                <TextField
                  fullWidth
                  label={`Opción ${option.opcion}`}
                  value={option.texto}
                  onChange={(e) => handleOptionChange(oIndex, e)}
                />
                {oIndex > 0 && (
                  <IconButton
                    onClick={() => removeOption(oIndex)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={addOption}
                startIcon={<AddIcon />}
                disabled={currentQuestion.opciones.length >= 4}
              >
                Agregar Opción
              </Button>
            </Box>

            <FormControl component="fieldset">
              <FormLabel component="legend">Respuesta Correcta</FormLabel>
              <RadioGroup
                row
                value={currentQuestion.respuesta_correcta}
                onChange={handleCorrectAnswerChange}
              >
                {currentQuestion.opciones.map((option) => (
                  <FormControlLabel
                    key={option.opcion}
                    value={option.opcion}
                    control={<Radio />}
                    label={option.opcion}
                    disabled={!option.texto}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Explicación de la respuesta"
              name="explicacion"
              multiline
              rows={2}
              value={currentQuestion.explicacion}
              onChange={handleQuestionChange}
            />
            <Button
              variant="outlined"
              onClick={handleAddOrUpdateQuestion}
              startIcon={editingIndex !== null ? <SaveIcon /> : <AddIcon />}
              disabled={
                saving ||
                isUploading ||
                !currentQuestion.texto_pregunta ||
                !currentQuestion.respuesta_correcta ||
                !currentQuestion.opciones.every(
                  (opt) => opt.texto.trim() !== ""
                )
              }
            >
              {editingIndex !== null
                ? "Actualizar Pregunta"
                : "Agregar Pregunta"}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="text"
                color="secondary"
                onClick={resetCurrentQuestion}
                sx={{ mt: 1 }}
              >
                Cancelar Edición
              </Button>
            )}
          </Paper>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving || isUploading || questions.length === 0}
            startIcon={
              saving || isUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ mt: 2, backgroundColor: "#4caf50" }}
          >
            {saving || isUploading
              ? "Guardando..."
              : "Actualizar Examen Completo"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/cursos/${courseId}/modulos`)}
            sx={{ mt: 1 }}
          >
            Cancelar y Volver
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditarExamen;
