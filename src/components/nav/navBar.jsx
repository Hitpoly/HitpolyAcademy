import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Drawer,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Alert,
  Tooltip,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookIcon from '@mui/icons-material/Book';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CommentIcon from '@mui/icons-material/Comment';

import ListaDeCategorias from "./components/MenuHamburguesa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import SequencePopup from "../../components/popups/SequencePopup";

const MenuDeNavegacion = () => {
  const affiliateSteps = [
    {
      title: "¡Bienvenido al Panel de Afiliados!",
      description: "Aquí te explicaremos cómo funciona nuestro programa de afiliados y cómo puedes empezar a ganar comisiones.",
      videoUrl: "/videos/afiliado_intro.mp4"
    },
    {
      title: "Genera tu Enlace Único",
      description: "Cada afiliado tiene un enlace de referencia personal. Asegúrate de usarlo para que podamos rastrear tus ventas.",
      videoUrl: "/videos/afiliado_link.mp4"
    },
    {
      title: "Materiales de Marketing",
      description: "Accede a nuestros recursos de marketing: banners, textos preescritos y guías para maximizar tus conversiones.",
      videoUrl: "/videos/afiliado_marketing.mp4"
    },
    {
      title: "Preguntas Frecuentes y Soporte",
      description: "Si tienes dudas, consulta nuestra sección de FAQ o contacta a nuestro equipo de soporte para ayuda personalizada.",
      videoUrl: "/videos/afiliado_faq.mp4"
    },
    {
      title: "¡Comienza a Ganar!",
      description: "Estás listo para promover y monetizar tu influencia. ¡Te deseamos mucho éxito en tu camino como afiliado!",
      videoUrl: "/videos/afiliado_final.mp4"
    },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAffiliatePopupOpen, setIsAffiliatePopupOpen] = useState(false);
  
  // Extraemos userRole y userCargo del contexto de autenticación
  const { user, userRole, userCargo } = useAuth(); 
  
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loadingSearchData, setLoadingSearchData] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // --- Lógica de Permisos ---
  const role = Number(userRole);
  const cargo = Number(userCargo);

  const isAdmin = role === 1;
  const isEmpresario = role === 2;
  const isProfesorAutorizado = role === 3 && cargo === 159; // Lógica para Pablo

  // Variable maestra para mostrar botones de Creador (Crear curso / Mis cursos)
  const puedeGestionarCursos = isAdmin || isEmpresario || isProfesorAutorizado;

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleOpenAffiliatePopup = () => {
    setIsAffiliatePopupOpen(true);
  };

  const handleCloseAffiliatePopup = () => {
    setIsAffiliatePopupOpen(false);
  };

  const handleAffiliateSequenceComplete = () => {
    handleCloseAffiliatePopup();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleCreateCourseClick = () => {
    navigate("/datos-de-curso");
  };

  const handleMyCoursesClick = () => {
    navigate("/mis-cursos");
  };

  const handleCreateAdsClick = () => {
    navigate("/crear-anuncios");
  };

  const handleAdminDashboardClick = () => {
    navigate("/admin-testimonios");
  };

  const handleEditProfilesClick = () => {
    navigate("/editar-perfiles");
  };

  useEffect(() => {
    const fetchDataForSearch = async () => {
      setLoadingSearchData(true);
      setSearchError(null);
      try {
        const [categoriesResponse, coursesResponse] = await Promise.all([
          fetch(
            "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getcategorias" }),
            }
          ),
          fetch(
            "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getCursos" }),
            }
          ),
        ]);

        if (!categoriesResponse.ok) throw new Error("Error al cargar categorías");
        const categoriesData = await categoriesResponse.json();
        const newCategoryMap = categoriesData.categorias.reduce((map, cat) => {
          map[cat.id] = cat.nombre;
          return map;
        }, {});
        setCategoryMap(newCategoryMap);

        if (!coursesResponse.ok) throw new Error("Error al cargar cursos");
        const coursesData = await coursesResponse.json();

        let fetchedCoursesArray;
        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
          fetchedCoursesArray = coursesData.cursos.cursos;
        } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
          fetchedCoursesArray = coursesData.cursos;
        } else {
          throw new Error("Estructura de cursos no válida");
        }

        const publishedCourses = fetchedCoursesArray.filter(
          (curso) => curso.estado === "Publicado"
        );
        setAllCourses(publishedCourses);

      } catch (err) {
        setSearchError(err.message);
      } finally {
        setLoadingSearchData(false);
      }
    };

    fetchDataForSearch();
  }, []);

  useEffect(() => {
    if (loadingSearchData || searchTerm === '') {
      setFilteredCourses([]);
      return;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = allCourses.filter((course) => {
      const courseName = course.titulo ? String(course.titulo).toLowerCase() : '';
      const categoryName = course.categoria_id ? (categoryMap[course.categoria_id] || '').toLowerCase() : '';
      return courseName.includes(lowercasedSearchTerm) || categoryName.includes(lowercasedSearchTerm);
    });
    setFilteredCourses(results);
  }, [searchTerm, allCourses, categoryMap, loadingSearchData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchActive(false);
      setSearchTerm('');
      setFilteredCourses([]);
    }, 150);
  };

  const isNotHomePage = location.pathname !== '/';

  return (
    <>
      <Box
        sx={{
          width: "100vw", height: "65px", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "0 16px", pr: 5, boxShadow: 1, backgroundColor: "#fff",
          position: "fixed", top: 0, left: 0, zIndex: 1200,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {isNotHomePage && (
            <IconButton onClick={handleGoHome} color="primary">
              <HomeIcon />
            </IconButton>
          )}
          <IconButton onClick={toggleDrawer(true)} color="inherit">
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ position: 'relative' }}>
            <TextField
              sx={{ display: { xs: "none", md: "flex" } }}
              size="small"
              variant="outlined"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchActive(true)}
              onBlur={handleSearchBlur}
            />
            {isSearchActive && (searchTerm !== '' || filteredCourses.length > 0) && (
              <Paper sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 1300, mt: 0.5, maxHeight: '300px', overflowY: 'auto', boxShadow: 3, width: 400 }}>
                {loadingSearchData ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>
                ) : filteredCourses.length === 0 ? (
                  <Typography sx={{ p: 2, color: 'text.secondary' }}>No hay resultados</Typography>
                ) : (
                  <List dense>
                    {filteredCourses.map((course) => (
                      <ListItem button key={course.id} onClick={() => navigate(`/curso/${course.id}`)}>
                        <ListItemText primary={course.titulo} secondary={categoryMap[course.categoria_id]} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* BOTONES PARA PABLO, ADMIN Y EMPRESARIO */}
          {puedeGestionarCursos && (
            <>
              <Tooltip title="Crear curso">
                <IconButton color="primary" onClick={handleCreateCourseClick} sx={{ border: '1px solid #1976d2' }}>
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mis cursos">
                <IconButton color="primary" onClick={handleMyCoursesClick} sx={{ border: '1px solid #1976d2' }}>
                  <BookIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* SOLO ADMINISTRADOR */}
          {isAdmin && (
            <>
              <Tooltip title="Crear anuncios">
                <IconButton color="primary" onClick={handleCreateAdsClick} sx={{ border: '1px solid #1976d2' }}>
                  <CampaignIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Comentarios">
                <IconButton color="primary" onClick={handleAdminDashboardClick} sx={{ border: '1px solid #1976d2' }}>
                  <CommentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar perfiles">
                <IconButton color="primary" onClick={handleEditProfilesClick} sx={{ border: '1px solid #1976d2' }}>
                  <PersonOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* AFILIADO (TODOS MENOS ADMIN) */}
          {!isAdmin && (
            <Tooltip title="Afiliado">
              <IconButton color="secondary" onClick={handleOpenAffiliatePopup} sx={{ border: '1px solid #9c27b0' }}>
                <EmojiEventsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }}>
          <ListaDeCategorias onCloseDrawer={handleCloseDrawer} />
        </Box>
      </Drawer>

      <SequencePopup
        steps={affiliateSteps}
        isOpen={isAffiliatePopupOpen}
        onClose={handleCloseAffiliatePopup}
        onSequenceComplete={handleAffiliateSequenceComplete}
      />
    </>
  );
};

export default MenuDeNavegacion;