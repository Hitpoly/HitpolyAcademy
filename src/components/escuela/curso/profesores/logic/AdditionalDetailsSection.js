import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const AdditionalDetailsSection = ({
  formData,
  handleChange,
  newLogoText,
  setNewLogoText,
  newDescription,
  setNewDescription,
  handleAddMarcaPlataforma,
  handleRemoveMarcaPlataforma,
  handleEditMarcaPlataforma, // Importar la función de edición de marcas
  newTemaTitle, // Renombrado de newTopicText
  setNewTemaTitle, // Renombrado de setNewTopicText
  handleAddTema, // Renombrado de handleAddTopic
  handleRemoveTema, // Renombrado de handleRemoveTopic
  handleEditTema, // Renombrado de handleEditTopic
}) => {
  // Estado para edición de temas
  const [editingTemaIndex, setEditingTemaIndex] = useState(null); // Renombrado
  const [currentEditingTemaText, setCurrentEditingTemaText] = useState(''); // Renombrado

  // Estado para edición de marcas
  const [editingMarcaIndex, setEditingMarcaIndex] = useState(null);
  const [editingLogoText, setEditingLogoText] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  // Funciones de edición para temas
  const startEditingTema = (index, text) => { // Renombrado
    setEditingTemaIndex(index);
    setCurrentEditingTemaText(text);
  };

  const saveEditedTema = (index) => { // Renombrado
    if (currentEditingTemaText.trim()) {
      handleEditTema(index, currentEditingTemaText.trim()); // Usar handleEditTema
      setEditingTemaIndex(null);
      setCurrentEditingTemaText('');
    }
  };

  const cancelEditingTema = () => { // Renombrado
    setEditingTemaIndex(null);
    setCurrentEditingTemaText('');
  };

  // Funciones de edición para marcas
  const startEditingMarca = (index, marca) => {
    setEditingMarcaIndex(index);
    setEditingLogoText(marca.logoText);
    setEditingDescription(marca.description);
  };

  const saveEditedMarca = () => {
    if (editingLogoText.trim() && editingDescription.trim()) {
      // Usar la función handleEditMarcaPlataforma pasada por props
      handleEditMarcaPlataforma(editingMarcaIndex, editingLogoText.trim(), editingDescription.trim());
      setEditingMarcaIndex(null);
      setEditingLogoText('');
      setEditingDescription('');
    }
  };

  const cancelEditingMarca = () => {
    setEditingMarcaIndex(null);
    setEditingLogoText('');
    setEditingDescription('');
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>
        Detalles Adicionales del Curso
      </Typography>

      {/* Marcas de Plataforma */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Marcas de Plataforma Asociadas
        </Typography>
        <TextField
          label="Texto del Logo"
          fullWidth
          margin="normal"
          value={newLogoText}
          onChange={(e) => setNewLogoText(e.target.value)}
        />
        <TextField
          label="Descripción de la Marca"
          fullWidth
          margin="normal"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddMarcaPlataforma}
          sx={{ mt: 1, mb: 2 }}
        >
          Añadir Marca
        </Button>
        {formData.marca_plataforma && formData.marca_plataforma.length > 0 && (
          <List dense>
            {formData.marca_plataforma.map((marca, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px dashed #eee' }}>
                {editingMarcaIndex === index ? (
                  <>
                    <TextField
                      label="Logo"
                      value={editingLogoText}
                      onChange={(e) => setEditingLogoText(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <TextField
                      label="Descripción"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={saveEditedMarca}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={cancelEditingMarca}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <ListItemText
                      primary={`Logo: ${marca.logoText}`}
                      secondary={`Descripción: ${marca.description}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => startEditingMarca(index, marca)}>
                        <EditIcon />
                      </IconButton>
                      {/* Pasar el ID de la marca para eliminar, si existe. Si no, pasar el índice. */}
                      <IconButton onClick={() => handleRemoveMarcaPlataforma(marca.id || index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Temario */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Temario del Curso
        </Typography>
        <TextField
          label="Añadir Nuevo Tema"
          fullWidth
          margin="normal"
          value={newTemaTitle} // Usar newTemaTitle
          onChange={(e) => setNewTemaTitle(e.target.value)} // Usar setNewTemaTitle
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTema(); // Usar handleAddTema
            }
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddTema} // Usar handleAddTema
          sx={{ mt: 1, mb: 2 }}
        >
          Añadir Tema
        </Button>
        {formData.temario && formData.temario.length > 0 && (
          <List dense>
            {formData.temario.map((tema, index) => ( // Cambiado topic por tema
              <ListItem key={index} sx={{ borderBottom: '1px dashed #eee' }}>
                {editingTemaIndex === index ? ( // Renombrado
                  <>
                    <TextField
                      value={currentEditingTemaText} // Renombrado
                      onChange={(e) => setCurrentEditingTemaText(e.target.value)} // Renombrado
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEditedTema(index); // Renombrado
                        }
                      }}
                      variant="standard"
                      fullWidth
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="save" onClick={() => saveEditedTema(index)}> {/* Renombrado */}
                        <SaveIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="cancel" onClick={cancelEditingTema}> {/* Renombrado */}
                        <CancelIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                ) : (
                  <>
                    <ListItemText primary={tema.titulo || tema} /> {/* Acceder a tema.titulo si existe, o tema directamente */}
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => startEditingTema(index, tema.titulo || tema)} // Renombrado y ajustado para tema.titulo
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveTema(index)} // Usar handleRemoveTema
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Otros Campos */}
      <TextField
        label="Horas por Semana"
        name="horas_por_semana"
        value={formData.horas_por_semana}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Fecha de Inicio de Clases"
        name="fecha_inicio_clases"
        type="date"
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
        value={formData.fecha_inicio_clases}
        onChange={handleChange}
      />
      <TextField
        label="Fecha Límite de Inscripción"
        name="fecha_limite_inscripcion"
        type="date"
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
        value={formData.fecha_limite_inscripcion}
        onChange={handleChange}
      />
      <TextField
        label="Ritmo de Aprendizaje"
        name="ritmo_aprendizaje"
        value={formData.ritmo_aprendizaje}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Tipo de Clase"
        name="tipo_clase"
        value={formData.tipo_clase}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Título de la Credencial"
        name="titulo_credencial"
        value={formData.titulo_credencial}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Descripción de la Credencial"
        name="descripcion_credencial"
        value={formData.descripcion_credencial}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
    </Box>
  );
};

export default AdditionalDetailsSection;