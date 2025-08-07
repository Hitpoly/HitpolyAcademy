import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
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

const parseJsonSafe = (str) => {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch (e) {
    return str || [];
  }
};

const EditarPreguntas = ({ questions, setQuestions, saving, setError }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    texto_pregunta: "",
    opciones: [{ opcion: "A", texto: "" }],
    respuesta_correcta: "",
    explicacion: "",
    id: null,
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const resetCurrentQuestion = () => {
    console.log("Restableciendo la pregunta actual.");
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

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, e) => {
    console.log(`Editando opción ${index}: ${e.target.value}`);
    const newOptions = [...currentQuestion.opciones];
    newOptions[index].texto = e.target.value;
    setCurrentQuestion((prev) => ({ ...prev, opciones: newOptions }));
  };

  const handleCorrectAnswerChange = (e) => {
    console.log(`Seleccionando respuesta correcta: ${e.target.value}`);
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
    console.log("Nueva opción agregada:", newOptions);
  };

  const removeOption = (index) => {
    console.log(`Eliminando opción en el índice: ${index}`);
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
      console.log(`Actualizando pregunta en el índice: ${editingIndex}`, currentQuestion);
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
    } else {
      if (questions.length >= 5) {
        setError("Solo se pueden agregar 5 preguntas por examen.");
        return;
      }
      console.log("Agregando nueva pregunta:", currentQuestion);
      setQuestions((prev) => [...prev, { ...currentQuestion, id: null }]);
    }
    resetCurrentQuestion();
  };

  const editQuestion = (index) => {
    const questionToEdit = questions[index];
    if (!questionToEdit) return;
    console.log(`Preparando para editar la pregunta en el índice: ${index}`, questionToEdit);

    setCurrentQuestion({
      ...questionToEdit,
      opciones: Array.isArray(questionToEdit.opciones)
        ? questionToEdit.opciones
        : parseJsonSafe(questionToEdit.opciones),
      respuesta_correcta: Array.isArray(parseJsonSafe(questionToEdit.respuesta_correcta))
        ? parseJsonSafe(questionToEdit.respuesta_correcta)[0]
        : parseJsonSafe(questionToEdit.respuesta_correcta),
    });
    setEditingIndex(index);
    setError("");
  };

  const deleteQuestion = (index) => {
    console.log(`Eliminando pregunta en el índice: ${index}`);
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (editingIndex === index) {
      resetCurrentQuestion();
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <>
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
          {editingIndex !== null ? "Editando Pregunta" : "Agregar Nueva Pregunta"}
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
    </>
  );
};

export default EditarPreguntas;