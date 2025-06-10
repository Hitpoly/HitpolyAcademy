import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const EnrollmentForm = () => {
  return (
    <Box
      sx={{
        padding: { xs: 3, md: 4 },
        width: "100%",
        margin: "0",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 2, color: "text.primary" }}
      >
        Descarga el prospecto
      </Typography>

      <TextField
        fullWidth
        label="Nombre"
        variant="outlined"
        margin="normal"
        size="small"
        sx={{
          "& .MuiInputBase-input": { color: "text.primary" },
          "& .MuiInputLabel-root": { color: "text.secondary" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#007bff",
          },
        }}
      />
      <TextField
        fullWidth
        label="Correo electrónico del trabajo"
        variant="outlined"
        margin="normal"
        type="email"
        size="small"
        sx={{
          "& .MuiInputBase-input": { color: "text.primary" },
          "& .MuiInputLabel-root": { color: "text.secondary" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#007bff",
          },
        }}
      />
      <TextField
        fullWidth
        label="Número de teléfono"
        variant="outlined"
        margin="normal"
        type="tel"
        size="small"
        sx={{
          "& .MuiInputBase-input": { color: "text.primary" },
          "& .MuiInputLabel-root": { color: "text.secondary" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#007bff",
          },
        }}
      />
      <FormControl
        fullWidth
        margin="normal"
        size="small"
        sx={{
          "& .MuiInputBase-input": { color: "text.primary" },
          "& .MuiInputLabel-root": { color: "text.secondary" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#007bff",
          },
          "& .MuiSelect-icon": { color: "text.secondary" },
        }}
      >
        <InputLabel id="education-select-label">
          Nivel Educativo más alto
        </InputLabel>
        <Select
          labelId="education-select-label"
          id="education-select"
          label="Nivel Educativo más alto"
          defaultValue=""
        >
          <MenuItem value="">
            <em>Selecciona</em>
          </MenuItem>
          <MenuItem value="bachelor">Licenciatura</MenuItem>
          <MenuItem value="master">Maestría</MenuItem>
          <MenuItem value="phd">Doctorado</MenuItem>
          <MenuItem value="other">Otro</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Checkbox size="small" sx={{ color: "text.secondary" }} />} // Color del checkbox
        label={
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: "text.secondary" }}
          >
            Me gustaría recibir actualizaciones sobre el programa y otros
            programas de GetSmarter.
          </Typography>
        }
        sx={{ mt: 1, mb: 1 }}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: "#007bff",
          "&:hover": {
            backgroundColor: "#0056b3",
          },
          mt: 2,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        Descargar prospecto
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block", textAlign: "center" }}
      >
        Al enviar este formulario, aceptas nuestros términos y condiciones.
      </Typography>
    </Box>
  );
};

export default EnrollmentForm;
