import React, { useEffect, useState } from "react";
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
  // Nueva prop para editar marcas de plataforma
  handleEditMarcaPlataforma,
}) => {
  // Estado local para la edición de temas
  const [editingTemaIndex, setEditingTemaIndex] = useState(null);
  const [currentEditingTemaTitle, setCurrentEditingTemaTitle] = useState("");

  // NUEVOS estados locales para la edición de marcas de plataforma
  const [editingMarcaIndex, setEditingMarcaIndex] = useState(null);
  const [currentEditingLogoText, setCurrentEditingLogoText] = useState("");
  const [currentEditingDescription, setCurrentEditingDescription] = useState("");

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

  // NUEVAS funciones para la edición de marcas de plataforma
  const handleStartEditingMarca = (index, logoText, description) => {
    setEditingMarcaIndex(index);
    setCurrentEditingLogoText(logoText);
    setCurrentEditingDescription(description);
  };

  const handleSaveEditingMarca = (index) => {
    if (currentEditingLogoText.trim() || currentEditingDescription.trim()) {
      handleEditMarcaPlataforma(
        index,
        currentEditingLogoText.trim(),
        currentEditingDescription.trim()
      );
      setEditingMarcaIndex(null);
      setCurrentEditingLogoText("");
      setCurrentEditingDescription("");
    }
  };

  const handleCancelEditingMarca = () => {
    setEditingMarcaIndex(null);
    setCurrentEditingLogoText("");
    setCurrentEditingDescription("");
  };
console.log("FORM DATA EN ADICIONAL DETAIL SECTIONS", formData);


  return (
    <>
      {/* --- SECCIÓN: TEMARIO DEL CURSO (PRIMERO) --- */}
      {/* Línea divisoria visible solo en móviles, oculta en desktop */}
      <Divider sx={{ my: 3, display: { xs: "block", sm: "none" } }} />
      <Typography variant="h6" gutterBottom>
        Temario del Curso
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
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
      <Divider sx={{ my: 3 }} /> {/* Este Divider siempre es visible */}
      <Typography variant="h6" gutterBottom>
        Detalles Adicionales
      </Typography>

      {/* Agrupación de 3 en 3 con Box y flexbox usando width porcentual */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "2%", justifyContent: "space-between" }}>
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Horas por Semana"
            name="horas_por_semana"
            value={formData.horas_por_semana}
            onChange={handleChange}
            fullWidth
            required
            helperText="Ej: 6 horas"
          />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Fecha Límite Inscripción"
            name="fecha_limite_inscripcion"
            type="date"
            value={formData.fecha_limite_inscripcion}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Fecha Inicio Clases"
            name="fecha_inicio_clases"
            type="date"
            value={formData.fecha_inicio_clases}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>

        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Ritmo de Aprendizaje"
            name="ritmo_aprendizaje"
            value={formData.ritmo_aprendizaje}
            onChange={handleChange}
            fullWidth
            select
            required
          >
            <MenuItem value="Flexible">Flexible</MenuItem>
            <MenuItem value="Fijo">Fijo</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Tipo de Clase"
            name="tipo_clase"
            value={formData.tipo_clase}
            onChange={handleChange}
            fullWidth
            select
            required
          >
            <MenuItem value="Online en vivo">Online en vivo</MenuItem>
            <MenuItem value="Grabadas">Grabadas</MenuItem>
            <MenuItem value="Presencial">Presencial</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <TextField
            label="Título Credencial"
            name="titulo_credencial"
            value={formData.titulo_credencial}
            onChange={handleChange}
            fullWidth
            required
            helperText="Recurso de la credencial"
          />
        </Box>

        {/* Último campo, ocupa el ancho completo */}
        <Box sx={{ width: "100%" }}>
          <TextField
            label="Descripción Credencial"
            name="descripcion_credencial"
            value={formData.descripcion_credencial}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            required
          />
        </Box>
      </Box>

      {/* --- SECCIÓN: MARCAS DE PLATAFORMA (TERCERO Y ÚLTIMO) --- */}
      <Divider sx={{ my: 3 }} /> {/* Este Divider siempre es visible */}
      <Typography variant="h6" gutterBottom>
        Marcas de Plataforma
      </Typography>
      {/* Mapear las marcas de plataforma existentes */}
      {formData.marca_plataforma.map((marca, index) => (
        <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, position: "relative" }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editingMarcaIndex === index ? (

              
              
              <>
                <TextField
                  label="Nombre de Marca"
                  value={currentEditingLogoText}
                  onChange={(e) => setCurrentEditingLogoText(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Descripción de Marca"
                  value={currentEditingDescription}
                  onChange={(e) => setCurrentEditingDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    aria-label="save"
                    onClick={() => handleSaveEditingMarca(index)}
                    color="primary"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    aria-label="cancel"
                    onClick={handleCancelEditingMarca}
                    color="warning"
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <>
                <TextField
                  label={`Nombre de Marca ${index + 1}`}
                  value={marca.logotext || ""}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label={`Descripción de Marca ${index + 1}`}
                  value={marca.description || ""}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    aria-label="edit"
                    onClick={() =>
                      handleStartEditingMarca(index, marca.logotext, marca.description)
                    }
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      handleRemoveMarcaPlataforma(marca.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      ))}

      {formData.marca_plataforma.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Aún no hay marcas de plataforma añadidas.
        </Typography>
      )}

      {/* Campos para añadir una nueva marca de plataforma */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <TextField
          label="Nuevo Nombre de Marca"
          value={newLogoText}
          onChange={(e) => setNewLogoText(e.target.value)}
          fullWidth
          size="small"
          required={!newLogoText && !newDescription && formData.marca_plataforma.length === 0}
        />
        <TextField
          label="Nueva Descripción de Marca"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          size="small"
          required={!newLogoText && !newDescription && formData.marca_plataforma.length === 0}
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