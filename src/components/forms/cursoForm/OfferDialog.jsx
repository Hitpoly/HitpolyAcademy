import React, { useState } from "react";
import { Dialog, DialogContent, Box, Button, Typography, IconButton, Divider, Stack, Paper, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CountdownBanner from "../../cronometro/CountdownBanner";


const OfferDialog = ({ open, onClose, onAprovecharPrueba, course, isInCart, handleGoToCart, handleAddToCart, cartLoading }) => {
  const originalPrice = 699.00;
  const discountPercent = 20;
  const discountAmount = originalPrice * (discountPercent / 100);
  const totalPrice = originalPrice - discountAmount;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          position: "relative"
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h6" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>
            🌞 Oferta de Verano
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#F21D6B", mt: 1, mb: 2 }}>
            {course?.title || "Conviértete en un Conector de Alto Nivel y Monetiza tus Habilidades Online"}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: "#fafafa", mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
            <Typography color="text.secondary">Precio original:</Typography>
            <Typography sx={{ textDecoration: "line-through", fontWeight: "bold" }}>${originalPrice.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, color: "#2e7d32" }}>
            <Typography>Descuento ({discountPercent.toFixed(2)}%):</Typography>
            <Typography fontWeight="bold">-${discountAmount.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" fontWeight="bold">Total:</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#F21D6B" }}>
              ${totalPrice.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            ⏳ Oferta válida hasta: 01 de junio de 2026
          </Typography>
        </Box>

        <Stack spacing={2}>
          {!isInCart ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={cartLoading}
              onClick={handleAddToCart}
              sx={{
                bgcolor: "#F21D6B",
                "&:hover": { bgcolor: "#d81a5f" },
                py: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: "0 4px 14px 0 rgba(242, 29, 107, 0.39)"
              }}
            >
              {cartLoading ? <CircularProgress size={24} color="inherit" /> : "🛒 Añadir al Carrito"}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGoToCart}
              sx={{
                bgcolor: "#2e7d32",
                "&:hover": { bgcolor: "#1b5e20" },
                py: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2
              }}
            >
              💳 Ir al Carrito
            </Button>
          )}

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={onAprovecharPrueba}
            sx={{
              borderColor: "#F21D6B",
              color: "#F21D6B",
              "&:hover": { borderColor: "#d81a5f", bgcolor: "rgba(242, 29, 107, 0.04)" },
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 2
            }}
          >
            🚀 Aprovechar Prueba e Ir al Curso
          </Button>

          <Button onClick={onClose} sx={{ color: "text.secondary" }}>
            Cerrar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default OfferDialog;
