import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Link,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function AnuncioCard({ id, titulo, descripcion, enlace, urlimagen, orden, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleClose();
    onEdit({ id, titulo, descripcion, enlace, urlimagen, orden });
  };

  const handleDeleteClick = () => {
    handleClose();
    onDelete(id);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 2,
        boxShadow: 3,
        borderRadius: '8px',
        position: 'relative',
        [theme.breakpoints.up('md')]: {
          flexDirection: 'row',
          height: 150,
        },
      }}
    >
      {urlimagen && (
        <CardMedia
          component="img"
          sx={{
            width: '100%',
            height: 250,
            flexShrink: 0,
            objectFit: 'cover',
            borderRadius: '8px 8px 0 0',
            [theme.breakpoints.up('md')]: {
              width: 220,
              height: '100%',
              borderRadius: '8px 0 0 8px',
            },
          }}
          image={urlimagen}
          alt={titulo}
        />
      )}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        width: '100%',
        [theme.breakpoints.up('md')]: {
          width: 'auto',
        },
      }}>
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

      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton
          aria-label="más opciones"
          aria-controls={open ? 'anuncio-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="anuncio-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon sx={{ mr: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        </Menu>
      </Box>
    </Card>
  );
}

export default AnuncioCard;