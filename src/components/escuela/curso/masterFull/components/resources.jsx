import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Resources = ({ resources }) => {
  console.log("Resources component received:", resources);

  if (!resources || resources.length === 0) {
    console.log("Resources component: No resources to display.");
    return null;
  }

  return (
    <Box sx={{ marginTop: '20px' }}>
      <Typography variant="h6" sx={{ marginBottom: '10px' }}>
        Recursos Adicionales
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {resources.map((resource, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: '#e0f7fa',
              padding: '15px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {resource.nombre} {/* Usar 'nombre' para el título */}
              </Typography>
              {/* Puedes mostrar el tipo de recurso si lo deseas */}
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Tipo: {resource.tipo}
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#0B8DB5',
                color: 'white',
                padding: '5px 10px',
              }}
              // Utiliza la 'fullUrl' preprocesada
              href={resource.fullUrl}
              target="_blank" // Esto asegura que siempre se abra en una nueva pestaña
              rel="noopener noreferrer" // Mejora la seguridad al abrir en una nueva pestaña
              download={resource.tipo === 'PDF'} // Mantiene la descarga para PDFs
            >
              {resource.tipo === 'PDF' ? 'Descargar PDF' : 'Ver Recurso'}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Resources;