import React, { useState } from "react"; // Importa useState
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Divider,
  IconButton,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

const AdditionalDetailsSection = ({
  formData,
  handleChange,
  newLogoText,
  setNewLogoText,
  newDescription,
  setNewDescription,
  handleAddMarcaPlataforma,
  handleRemoveMarcaPlataforma,
  newTemaTitle,
  setNewTemaTitle,
  handleAddTema,
  handleRemoveTema,
  handleEditTema,
}) => {
  // Nuevo estado local para saber qué tema se está editando
  const [editingTemaIndex, setEditingTemaIndex] = useState(null);
  const [currentEditingTemaTitle, setCurrentEditingTemaTitle] = useState("");

  const handleStartEditingTema = (index, title) => {
    setEditingTemaIndex(index);
    setCurrentEditingTemaTitle(title);
  };

  const handleSaveEditingTema = (index) => {
    if (currentEditingTemaTitle.trim()) {
      handleEditTema(index, currentEditingTemaTitle);
      setEditingTemaIndex(null);
      setCurrentEditingTemaTitle("");
    }
  };

  const handleCancelEditingTema = () => {
    setEditingTemaIndex(null);
    setCurrentEditingTemaTitle("");
  };

  return (
    <>
      {/* --- SECCIÓN: TEMARIO DEL CURSO (PRIMERO) --- */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Temario del Curso
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <TextField
          label="Título del Nuevo Tema"
          variant="outlined"
          fullWidth
          value={newTemaTitle}
          onChange={(e) => setNewTemaTitle(e.target.value)}
          size="small"
        />
        <Button
          onClick={handleAddTema}
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ alignSelf: "flex-end", mt: 1 }}
        >
          Añadir Tema
        </Button>
      </Box>

      {formData.temario.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Temas Añadidos:
          </Typography>
          <List dense>
            {formData.temario.map((tema, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <>
                    {editingTemaIndex === index ? (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="save"
                          onClick={() => handleSaveEditingTema(index)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="cancel"
                          onClick={handleCancelEditingTema}
                          color="warning"
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleStartEditingTema(index, tema.titulo)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveTema(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                {editingTemaIndex === index ? (
                  <TextField
                    variant="standard"
                    value={currentEditingTemaTitle}
                    onChange={(e) => setCurrentEditingTemaTitle(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-input": {
                        padding: "4px 0",
                      },
                    }}
                    autoFocus
                  />
                ) : (
                  <ListItemText primary={`${index + 1}. ${tema.titulo}`} />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {formData.temario.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          Aún no hay temas añadidos.
        </Typography>
      )}

      {/* --- SECCIÓN: DETALLES ADICIONALES (SEGUNDO) --- */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Detalles Adicionales
      </Typography>

      <TextField
        label="Horas por Semana"
        name="horas_por_semana"
        value={formData.horas_por_semana}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        helperText="Ej: 6 horas"
      />
      <TextField
        label="Fecha Límite Inscripción"
        name="fecha_limite_inscripcion"
        type="date"
        value={formData.fecha_limite_inscripcion}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Fecha Inicio Clases"
        name="fecha_inicio_clases"
        type="date"
        value={formData.fecha_inicio_clases}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Ritmo de Aprendizaje"
        name="ritmo_aprendizaje"
        value={formData.ritmo_aprendizaje}
        onChange={handleChange}
        fullWidth
        margin="normal"
        select
        required
      >
        <MenuItem value="Flexible">Flexible</MenuItem>
        <MenuItem value="Fijo">Fijo</MenuItem>
      </TextField>
      <TextField
        label="Tipo de Clase"
        name="tipo_clase"
        value={formData.tipo_clase}
        onChange={handleChange}
        fullWidth
        margin="normal"
        select
        required
      >
        <MenuItem value="Online en vivo">Online en vivo</MenuItem>
        <MenuItem value="Grabadas">Grabadas</MenuItem>
        <MenuItem value="Presencial">Presencial</MenuItem>
      </TextField>
      <TextField
        label="Título Credencial"
        name="titulo_credencial"
        value={formData.titulo_credencial}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        helperText="Recurso de la credencial"
      />
      <TextField
        label="Descripción Credencial"
        name="descripcion_credencial"
        value={formData.descripcion_credencial}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={2}
        required
      />

      {/* --- SECCIÓN: MARCAS DE PLATAFORMA (TERCERO Y ÚLTIMO) --- */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Marcas de Plataforma
      </Typography>
      {/* Mapear las marcas de plataforma existentes */}
      {formData.marca_plataforma.map((marca, index) => (
        <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, position: "relative" }}>
          <IconButton
            onClick={() => {
              handleRemoveMarcaPlataforma(index);
            }}
            color="error"
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
          <TextField
            label={`Nombre de Marca ${index + 1}`}
            value={marca.logotext || ""}
            fullWidth
            margin="normal"
            size="small"
            sx={{ mb: 1 }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label={`Descripción de Marca ${index + 1}`}
            value={marca.description || ""}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Paper>
      ))}

      {/* Campos para añadir una nueva marca de plataforma */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <TextField
          label="Nuevo Nombre de Marca"
          value={newLogoText}
          onChange={(e) => setNewLogoText(e.target.value)}
          fullWidth
          size="small"
          required={
            !newLogoText && !newDescription && formData.marca_plataforma.length === 0
          }
        />
        <TextField
          label="Nueva Descripción de Marca"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          size="small"
          required={
            !newLogoText && !newDescription && formData.marca_plataforma.length === 0
          }
        />
        <Button
          onClick={handleAddMarcaPlataforma}
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ alignSelf: "flex-end", mt: 1 }}
        >
          Añadir Marca
        </Button>
      </Box>
    </>
  );
};

export default AdditionalDetailsSection;