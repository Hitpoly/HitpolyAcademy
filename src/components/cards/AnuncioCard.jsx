// src/components/AnuncioCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Link,
} from '@mui/material';

function AnuncioCard({ titulo, descripcion, enlace, urlimagen }) {
  return (
    <Card sx={{ display: 'flex', marginBottom: 2, boxShadow: 3, borderRadius: '8px' }}>
      {urlimagen && (
        <CardMedia
          component="img"
          sx={{ width: 250, height: 150, flexShrink: 0, objectFit: 'cover' }}
          image={urlimagen}
          alt={titulo}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {descripcion}
          </Typography>
          {enlace && (
            <Link href={enlace} target="_blank" rel="noopener" variant="body2">
              Ver más
            </Link>
          )}
        </CardContent>
      </Box>
    </Card>
  );
}

export default AnuncioCard;