import React from 'react';
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Divider,
  IconButton,
  Paper, 
  Button 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; 

const AdditionalDetailsSection = ({ formData, handleChange, newLogoText, setNewLogoText, newDescription, setNewDescription, handleAddMarcaPlataforma, handleRemoveMarcaPlataforma }) => {

  console.log("INFO QUE LLEGA", formData);


  
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>Detalles Adicionales</Typography>

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

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>Marcas de Plataforma</Typography>
      {/* Mapear las marcas de plataforma existentes */}
      {formData.marca_plataforma.map((marca, index) => (
  <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, position: 'relative' }}>
    <IconButton
      onClick={() => handleRemoveMarcaPlataforma(index)}
      color="error"
      size="small"
      sx={{ position: 'absolute', top: 8, right: 8 }}
    >
      <RemoveCircleOutlineIcon />
    </IconButton>
    <TextField
      label={`Nombre de Marca ${index + 1}`}
      value={marca.logotext || ''}      
      fullWidth
      margin="normal"
      size="small"
      sx={{ mb: 1 }}
    />
    <TextField
      label={`Descripción de Marca ${index + 1}`}
      value={marca.description || ''}  
      fullWidth
      margin="normal"
      multiline
      rows={2}
      size="small"
    />
  </Paper>
))}


      {/* Campos para añadir una nueva marca de plataforma */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField
          label="Nuevo Nombre de Marca"
          value={newLogoText}
          onChange={(e) => setNewLogoText(e.target.value)}
          fullWidth
          size="small"
          // La lógica de 'required' puede ajustarse, por ejemplo, si solo uno de los dos está lleno
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
          // La lógica de 'required' puede ajustarse
          required={!newLogoText && !newDescription && formData.marca_plataforma.length === 0} 
        />
        <Button
          onClick={handleAddMarcaPlataforma}
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ alignSelf: 'flex-end', mt: 1 }}
        >
          Añadir Marca
        </Button>
      </Box>
    </>
  );
};

export default AdditionalDetailsSection;