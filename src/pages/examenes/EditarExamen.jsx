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
import { useAuth } from "../../context/AuthContext";

// Endpoints
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

const parseJsonSafe = (str) => {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch (e) {
    console.warn("Error parsing JSON, returning original string or empty array:", str);
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
      console.error("Error al subir imagen:", err);
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

        if (examResponse.data.status !== "success" || !examResponse.data.examenes) {
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

        if (questionsResponse.data.status === "success" && questionsResponse.data.preguntasYrespuestas) {
          const examQuestions = questionsResponse.data.preguntasYrespuestas.filter(
            (q) => String(q.examen_id) === String(examId)
          );
          
          console.log("Datos de preguntas crudos desde la API:", examQuestions); // Log para ver los datos sin procesar

          setQuestions(examQuestions.map(q => ({
            ...q,
            // Asegurar que las opciones y la respuesta correcta se parseen correctamente
            opciones: parseJsonSafe(q.opciones),
            respuesta_correcta: Array.isArray(parseJsonSafe(q.respuesta_correcta)) ? parseJsonSafe(q.respuesta_correcta)[0] : parseJsonSafe(q.respuesta_correcta),
          })));
        }
      } catch (err) {
        console.error("Error en fetchData:", err);
        setError(err.message || "Examen no encontrado o formato de datos incorrecto.");
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
      respuesta_correcta: prev.respuesta_correcta === prev.opciones[index].opcion ? "" : prev.respuesta_correcta
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
      setError("Por favor, completa el texto de la pregunta, al menos 2 opciones válidas y selecciona una respuesta correcta.");
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
    } else {
      if (questions.length >= 5) {
        setError("Solo se pueden agregar 5 preguntas por examen.");
        return;
      }
      setQuestions((prev) => [...prev, { ...currentQuestion, id: null }]); // Asegurar que el id de una nueva pregunta sea null
    }
    resetCurrentQuestion();
  };

  const editQuestion = (index) => {
    const questionToEdit = questions[index];
    if (!questionToEdit) return;

    setCurrentQuestion({
      ...questionToEdit,
      // Asegurar que las opciones y la respuesta correcta estén en el formato correcto
      opciones: Array.isArray(questionToEdit.opciones) ? questionToEdit.opciones : parseJsonSafe(questionToEdit.opciones),
      respuesta_correcta: Array.isArray(parseJsonSafe(questionToEdit.respuesta_correcta)) ? parseJsonSafe(questionToEdit.respuesta_correcta)[0] : parseJsonSafe(questionToEdit.respuesta_correcta),
    });
    setEditingIndex(index);
    setError("");
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (editingIndex === index) {
      resetCurrentQuestion();
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
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
        throw new Error(examResponse.data.message || "Error al editar el examen.");
      }

      await Promise.all(
        questions.map(async (question) => {
          const optionsToSend = JSON.stringify(question.opciones);
          const finalCorrectAnswer = JSON.stringify([question.respuesta_correcta]);

          const questionPayload = {
            examen_id: formData.id,
            texto_pregunta: question.texto_pregunta,
            opciones: optionsToSend,
            respuesta_correcta: finalCorrectAnswer,
            explicacion: question.explicacion,
            fecha_creacion: new Date().toISOString().slice(0, 19).replace("T", " "),
          };

          if (question.id) {
            // Llama a la API de edición de preguntas
            const response = await axios.post(
              API_EDITAR_PREGUNTA,
              { ...questionPayload, accion: "edit", id: question.id },
              { headers: { "Content-Type": "application/json" } }
            );
            
            // --- LOG AGREGADO AQUÍ ---
            console.log(`Respuesta de la API de edición de pregunta (ID: ${question.id}):`, response.data);
            // -------------------------

          } else {
            // Llama a la API de carga de nuevas preguntas
            await axios.post(
              API_CARGAR_PREGUNTAS,
              { ...questionPayload, accion: "preguntasExamen" },
              { headers: { "Content-Type": "application/json" } }
            );
          }
        })
      );

      setSuccess("¡Examen y preguntas actualizados con éxito! Redirigiendo...");
      setTimeout(() => {
        navigate(`/cursos/${courseId}/modulos`);
      }, 2000);
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setError(err.message || "Ocurrió un error al actualizar el examen y/o las preguntas.");
    } finally {
      setSaving(false);
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
          Cargando datos del examen...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Editar Examen para el Curso ID: {courseId}
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
                      Respuesta Correcta:{" "}
                      {q.respuesta_correcta || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => editQuestion(qIndex)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteQuestion(qIndex)}
                      color="error"
                    >
                      <DeleteIcon />
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
                !currentQuestion.opciones.every((opt) => opt.texto.trim() !== "")
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