import React, { useState } from 'react';
import { Box } from '@mui/material';
import CategoryCreator from './CategoryCreator';
import CategoryListManager from './CategoryListManager';

function CategoryManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCategoryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box
      sx={{
        p: 4, // Padding alrededor del contenido
        width: '100%', // Asegura que el contenedor principal ocupe todo el ancho disponible
        boxSizing: 'border-box', // Incluye el padding en el ancho total
        mx: 'auto', // Centra el contenido si el padre tiene un ancho limitado (aunque aquí será 100%)
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        fontFamily: 'Roboto, sans-serif',
        display: 'flex', // Habilita Flexbox para organizar los elementos hijos
        flexDirection: { xs: 'column', md: 'row' }, // Columnas en extra-pequeño, filas en mediano y más grande
        gap: { xs: 4, md: 4 }, // Espacio entre los elementos hijos. En 'md', será horizontal.
                               // Manteniendo el mismo gap para la consistencia vertical/horizontal.
      }}
    >
      {/* Panel de Creación de Categoría */}
      <Box
        sx={{
          width: { xs: '100%', md: '40%' }, // 100% en móviles, 40% en PC
          flexShrink: 0, // Evita que se encoja si el otro Box necesita más espacio
          // Si necesitas un estilo de "panel" como Paper, envuélvelo en Paper dentro de este Box.
          // Por ahora, solo estamos aplicando el layout flex.
        }}
      >
        <CategoryCreator onCategoryCreated={handleCategoryCreated} />
      </Box>

      {/* Panel de Gestión (Listar, Editar, Eliminar) de Categorías */}
      <Box
        sx={{
          width: { xs: '100%', md: '60%' }, // 100% en móviles, 60% en PC
          flexGrow: 1, // Permite que crezca para ocupar el espacio restante
        }}
      >
        <CategoryListManager refreshCategoriesTrigger={refreshTrigger} />
      </Box>
    </Box>
  );
}

export default CategoryManager;