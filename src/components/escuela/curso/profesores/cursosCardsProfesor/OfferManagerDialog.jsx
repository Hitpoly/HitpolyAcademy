import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

const API_OFERTAS = "https://apiacademy.hitpoly.com/ajax/ofertasController.php";

const OfferManagerDialog = ({ open, course, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [offerData, setOfferData] = useState({
    descuento: 0,
    precio_oferta: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: true,
  });

  useEffect(() => {
    if (open && course) {
      fetchOffer();
    }
  }, [open, course]);

  const fetchOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_OFERTAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getOferta", curso_id: course.id }),
      });
      const data = await response.json();
      if (data.status === "success" && data.oferta) {
        setOfferData({
          descuento: data.oferta.descuento || 0,
          precio_oferta: data.oferta.precio_oferta || "",
          fecha_inicio: data.oferta.fecha_inicio ? data.oferta.fecha_inicio.split(' ')[0] : "",
          fecha_fin: data.oferta.fecha_fin ? data.oferta.fecha_fin.split(' ')[0] : "",
          estado: data.oferta.estado == 1,
        });
      } else {
        // Reset if no offer found
        setOfferData({
          descuento: 0,
          precio_oferta: "",
          fecha_inicio: "",
          fecha_fin: "",
          estado: true,
        });
      }
    } catch (err) {
      setError("Error al obtener la oferta.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        accion: "saveOferta",
        curso_id: course.id,
        profesor_id: course.profesor_id,
        descuento: offerData.descuento,
        precio_oferta: offerData.precio_oferta,
        fecha_inicio: offerData.fecha_inicio ? `${offerData.fecha_inicio} 00:00:00` : null,
        fecha_fin: offerData.fecha_fin ? `${offerData.fecha_fin} 23:59:59` : null,
        estado: offerData.estado ? 1 : 0,
      };

      const response = await fetch(API_OFERTAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === "success") {
        onClose();
      } else {
        setError(data.message || "Error al guardar la oferta.");
      }
    } catch (err) {
      setError("Error de conexión al guardar la oferta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gestionar Oferta: {course?.titulo}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Porcentaje de Descuento (%)"
              name="descuento"
              type="number"
              value={offerData.descuento}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Precio en Oferta Fijo (Opcional)"
              name="precio_oferta"
              type="number"
              value={offerData.precio_oferta}
              onChange={handleChange}
              fullWidth
              helperText="Si dejas esto en blanco, se calculará en base al porcentaje."
            />
            <TextField
              label="Fecha de Inicio"
              name="fecha_inicio"
              type="date"
              value={offerData.fecha_inicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fecha de Fin"
              name="fecha_fin"
              type="date"
              value={offerData.fecha_fin}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={offerData.estado}
                  onChange={handleChange}
                  name="estado"
                  color="primary"
                />
              }
              label="Oferta Activa"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading || saving}>
          {saving ? <CircularProgress size={24} /> : "Guardar Oferta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OfferManagerDialog;
