import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Menu, MenuItem, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ModuleCard = ({ module, onEdit, onDelete, onViewClasses }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                        <Typography variant="h6" component="div">
                            {module.orden}. {module.titulo}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            {module.descripcion}
                        </Typography>
                    </Box>
                    <Button
                        aria-controls="module-menu"
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                        size="small"
                    >
                        <MoreVertIcon />
                    </Button>
                    <Menu
                        id="module-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={() => { onEdit(module); handleMenuClose(); }}>Editar Módulo</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { onDelete(module.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                            Eliminar Módulo
                        </MenuItem>
                    </Menu>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => onViewClasses(module)} // Pasa el objeto completo del módulo
                >
                    Ver Clases
                </Button>
            </CardContent>
        </Card>
    );
};

export default ModuleCard;