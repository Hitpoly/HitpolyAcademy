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
        p: 4,
        width: '100%', 
        boxSizing: 'border-box', 
        mx: 'auto', 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        fontFamily: 'Roboto, sans-serif',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: { xs: 4, md: 4 },                                
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '40%' }, 
          flexShrink: 0, }}
      >
        <CategoryCreator onCategoryCreated={handleCategoryCreated} />
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '60%' }, 
          flexGrow: 1, 
        }}
      >
        <CategoryListManager refreshCategoriesTrigger={refreshTrigger} />
      </Box>
    </Box>
  );
}

export default CategoryManager;