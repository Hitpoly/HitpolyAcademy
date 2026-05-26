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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../../../context/AuthContext";

const API_CARGAR_EXAMEN =
  "https://apiacademy.hitpoly.com/ajax/cargarExamenController.php";
const API_CARGAR_PREGUNTAS =
  "https://apiacademy.hitpoly.com/ajax/preguntasExamenController.php";
const CLOUDINARY_API_URL =
  "https://apisistemamembresia.hitpoly.com/ajax/Cloudinary.php";

const API_GET_CURSOS =
  "https://apiacademy.hitpoly.com/ajax/traerCursosController.php";

const CrearExamen = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    texto_pregunta: "",
    opciones: [{ opcion: "A", texto: "" }],
    respuesta_correcta: "",
    explicacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [courseName, setCourseName] = useState("");
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

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
        setError("Error de red al obtener el nombre del curso.");
      } finally {
        setIsLoadingCourse(false);
      }
    };
    fetchCourseName();
  }, [courseId]);

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
        throw new Error(
          "No se recibió una URL válida desde el backend de Cloudinary."
        );
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "Ocurrió un error al intentar subir la imagen. Por favor, inténtalo de nuevo.",
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(URL.createObjectURL(file));
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

  const removeQuestion = (index) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index)
    );
    setError("");
  };

  const editQuestion = (index) => {
    const questionToEdit = questions[index];
    if (questionToEdit) {
      setCurrentQuestion({
        texto_pregunta: questionToEdit.texto_pregunta,
        opciones: questionToEdit.opciones,
        respuesta_correcta: questionToEdit.respuesta_correcta,
        explicacion: questionToEdit.explicacion,
      });
      removeQuestion(index);
    }
  };

  const addQuestion = () => {
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

    setQuestions((prev) => [...prev, currentQuestion]);
    setCurrentQuestion({
      texto_pregunta: "",
      opciones: [{ opcion: "A", texto: "" }],
      respuesta_correcta: "",
      explicacion: "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!formData.titulo || !formData.descripcion) {
      setError("El título y la descripción del examen son obligatorios.");
      setLoading(false);
      return;
    }
    if (!selectedFile) {
      setError("La imagen de portada es obligatoria.");
      setLoading(false);
      return;
    }

    if (questions.length === 0) {
      setError("Debes agregar al menos una pregunta al examen.");
      setLoading(false);
      return;
    }

    try {
      const uploadedImageUrl = await uploadImage(selectedFile);
      if (!uploadedImageUrl) {
        throw new Error("Error al subir la imagen. No se pudo obtener la URL.");
      }

      const examPayload = {
        accion: "postExamen",
        curso_id: parseInt(courseId, 10),
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        imagen_portada: uploadedImageUrl,
        creado_por: user?.id || null,
      };

      const examResponse = await axios.post(API_CARGAR_EXAMEN, examPayload, {
        headers: { "Content-Type": "application/json" },
      });

      if (examResponse.data.status !== "success") {
        throw new Error(
          examResponse.data.message || "Error al crear el examen."
        );
      }

      const examenId = examResponse.data.id;

      for (const question of questions) {
        const questionPayload = {
          accion: "preguntasExamen",
          examen_id: examenId,
          texto_pregunta: question.texto_pregunta,
          opciones: question.opciones,
          respuesta_correcta: [question.respuesta_correcta],
          explicacion: question.explicacion,
          fecha_creacion: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        };

        const questionResponse = await axios.post(
          API_CARGAR_PREGUNTAS,
          questionPayload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (questionResponse.data.status !== "success") {
          throw new Error(
            `Error al crear la pregunta: ${question.texto_pregunta}`
          );
        }
      }

      setSuccess("¡Examen y preguntas creados con éxito!");
      setTimeout(() => {
        navigate(`/cursos/${courseId}/modulos`);
      }, 2000);
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error inesperado al guardar el examen y las preguntas."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingCourse) {
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
          Cargando información del curso...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Crear Examen para el Curso:{" "}
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
              disabled={isUploading || loading}
            >
              {isUploading ? (
                <CircularProgress size={24} />
              ) : (
                "Seleccionar Imagen de Portada"
              )}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Archivo seleccionado: {selectedFile.name}
              </Typography>
            )}
            {imageUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Previsualización de la Imagen:
                </Typography>
                <img
                  src={imageUrl}
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
            <Paper
              key={qIndex}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: "4px solid #4caf50",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Pregunta {qIndex + 1}: {q.texto_pregunta}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Respuesta Correcta: {q.respuesta_correcta}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={() => editQuestion(qIndex)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => removeQuestion(qIndex)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}

          <Paper
            elevation={2}
            sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
          >
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
              onClick={addQuestion}
              startIcon={<AddIcon />}
              disabled={
                questions.length >= 5 ||
                !currentQuestion.texto_pregunta ||
                !currentQuestion.respuesta_correcta ||
                currentQuestion.opciones.some((opt) => opt.texto.trim() === "")
              }
            >
              Agregar Pregunta
            </Button>
          </Paper>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || isUploading || questions.length === 0}
            startIcon={
              loading || isUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ mt: 2, backgroundColor: "#4caf50" }}
          >
            {loading || isUploading
              ? "Guardando..."
              : "Guardar Examen Completo"}
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

export default CrearExamen;
