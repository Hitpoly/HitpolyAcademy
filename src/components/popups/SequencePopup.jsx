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
import CourseVideo from '../videos/Videopopup'; // Asegúrate de que la ruta sea correcta

// Datos de la secuencia de popups integrados directamente en el componente
const DEFAULT_STEPS = [
  {
    title: "¡Bienvenido a Master Full!",
    description: "Estamos emocionados de tenerte aquí. En este primer paso, te presentaremos lo que lograrás en nuestro programa de 7 días para ser un Setter Digital de Élite.",
    videoUrl: "/videos/nuevo.mp4" // Reemplaza con tus URLs de video reales
  },
  {
    title: "Paso 1: Fundamentos de la Prospección",
    description: "Hoy, profundizaremos en las bases para identificar y contactar a prospectos calificados. Aprenderás las herramientas clave y las primeras estrategias.",
    videoUrl: "/videos/nuevo.mp4"
  },
  {
    title: "Paso 2: Desarrolla tu Presencia Digital",
    description: "Te mostraremos cómo crear perfiles profesionales en redes sociales y una página web que te posicionarán como un experto y atraerán oportunidades.",
    videoUrl: "/videos/nuevo.mp4"
  },
  {
    title: "Paso 3: ¡Listo para la Pasantía y el Empleo!",
    description: "Has completado tu formación. Ahora, te guiaremos para iniciar tu pasantía pagada y te conectaremos con empresas reales que buscan Setters como tú. ¡Tu futuro comienza ahora!",
    videoUrl: "/videos/nuevo.mp4"
  },
  {
    title: "¡Felicidades, Has Llegado al Final!",
    description: "Esperamos que esta introducción te haya dado una visión clara de tu camino. Si tienes alguna pregunta o estás listo para empezar, no dudes en contactarnos.",
    videoUrl: "/videos/nuevo.mp4"
  },
];


const SequencePopup = ({ isOpen, onClose, onSequenceComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = DEFAULT_STEPS;

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!steps || steps.length === 0 || !steps[currentStepIndex]) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

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

  return (
    <Dialog
      open={isOpen}
      // Quitamos disableEscapeKeyDown={true} para permitir el cierre con Escape
      // Modificamos onClose para que simplemente llame a la función onClose prop
      onClose={onClose} // Esto permite cerrar al pinchar fuera o con Escape
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
          <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
            <CourseVideo videoUrl={currentStep.videoUrl} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
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