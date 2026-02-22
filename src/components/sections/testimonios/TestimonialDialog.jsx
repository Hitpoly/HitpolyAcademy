import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const TestimonialDialog = ({ open, onClose, name, text }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>
      Testimonio de {name}
    </DialogTitle>
    <DialogContent dividers>
      <DialogContentText sx={{ color: "text.primary", whiteSpace: "pre-line" }}>
        {text}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default TestimonialDialog;