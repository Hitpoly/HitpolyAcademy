// src/components/SequencePopup.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 

// ¡IMPORTA VideoPlayerWithControls en lugar de Videopopup!
// Asegúrate de que esta ruta sea correcta según donde tengas VideoPlayerWithControls.jsx
import VideoPlayerWithControls from '../videos/VideoPlayerWithControls'; 

// Datos de la secuencia de popups integrados directamente en el componente
const DEFAULT_STEPS = [
  {
    title: "¡Bienvenido a Master Full!",
    description: "Estamos emocionados de tenerte aquí. En este primer paso, te presentaremos lo que lograrás en nuestro programa de 7 días para ser un Setter Digital de Élite.",
    // **¡IMPORTANTE! Reemplaza estas URLs con enlaces REALES de videos de YouTube.**
    // Dejo los ejemplos de URL que habías puesto, pero recuerda cambiarlos por videos reales.
    videoUrl: "https://youtu.be/lkGrtQL1Z34"
  },
  {
    title: "Paso 1: Fundamentos de la Prospección",
    description: "Hoy, profundizaremos en las bases para identificar y contactar a prospectos calificados. Aprenderás las herramientas clave y las primeras estrategias.",
    videoUrl: "https://youtu.be/rAUz_Qf4Naw"
  },
  {
    title: "Paso 2: Desarrolla tu Presencia Digital",
    description: "Te mostraremos cómo crear perfiles profesionales en redes sociales y una página web que te posicionarán como un experto y atraerán oportunidades.",
    videoUrl: "https://youtu.be/lkGrtQL1Z34"
  },
  {
    title: "Paso 3: ¡Listo para la Pasantía y el Empleo!",
    description: "Has completado tu formación. Ahora, te guiaremos para iniciar tu pasantía pagada y te conectaremos con empresas reales que buscan Setters como tú. ¡Tu futuro comienza ahora!",
    videoUrl: "https://youtu.be/rAUz_Qf4Naw"
  },
  {
    title: "¡Felicidades, Has Llegado al Final!",
    description: "Esperamos que esta introducción te haya dado una visión clara de tu camino. Si tienes alguna pregunta o estás listo para empezar, no dudes en contactarnos.",
    videoUrl: "https://youtu.be/lkGrtQL1Z34"
  },
];


const SequencePopup = ({ isOpen, onClose, onSequenceComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = DEFAULT_STEPS;

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0); // Reinicia el índice al abrir el popup
    }
  }, [isOpen]);

  // Si no hay pasos o el índice actual está fuera de rango, no renderiza nada.
  if (!steps || steps.length === 0 || !steps[currentStepIndex]) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0; // Para saber si estamos en el primer paso
  const isLastStep = currentStepIndex === steps.length - 1; // Para saber si estamos en el último paso

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
    } else {
      onClose(); // Cierra el modal al finalizar la secuencia
      if (onSequenceComplete) {
        onSequenceComplete(); // Llama a la función para marcar como completado
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1); // Retrocede un paso
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div">
          {currentStep.title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {currentStep.description}
        </Typography>
        {currentStep.videoUrl && (
          <Box>
            {/* ¡Aquí está el cambio clave! Usa VideoPlayerWithControls */}
            <VideoPlayerWithControls videoUrl={currentStep.videoUrl} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          onClick={handleBack}
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<ArrowBackIcon />}
          sx={{ minWidth: 150 }}
          disabled={isFirstStep}
        >
          Atrás
        </Button>
        <Button
          onClick={handleNext}
          variant="contained"
          color="primary"
          size="large"
          endIcon={<PlayCircleOutlineIcon />}
          sx={{ minWidth: 150 }}
        >
          {isLastStep ? 'Finalizar' : 'Siguiente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SequencePopup;