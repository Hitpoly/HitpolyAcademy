import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Button,
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
import BookIcon from '@mui/icons-material/Book'; // Importa BookIcon
import ListaDeCategorias from "./components/MenuHamburguesa";
import TemporaryDrawer from "./components/drawer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import SequencePopup from "../../components/popups/SequencePopup";

// ... (resto de tu código, affiliateSteps, y funciones)

const MenuDeNavegacion = () => {

 const affiliateSteps = [ // ¡ESTA ES LA CLAVE!
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
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loadingSearchData, setLoadingSearchData] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Eliminamos searchBoxRef ya que usaremos onBlur/onFocus del TextField
  // const searchBoxRef = useRef(null); 

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
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

        // Procesamiento de Categorías
        if (!categoriesResponse.ok) {
          const errorText = await categoriesResponse.text();
          throw new Error(
            `Error al cargar categorías: ${categoriesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const categoriesData = await categoriesResponse.json();
        if (
          categoriesData.status !== "success" ||
          !Array.isArray(categoriesData.categorias)
        ) {
          throw new Error(
            categoriesData.message || "Datos de categorías inválidos."
          );
        }
        const newCategoryMap = categoriesData.categorias.reduce((map, cat) => {
          map[cat.id] = cat.nombre;
          return map;
        }, {});
        setCategoryMap(newCategoryMap);

        // Procesamiento de Cursos
        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          throw new Error(
            `Error al cargar cursos: ${coursesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const coursesData = await coursesResponse.json();

        let fetchedCoursesArray;
        if (coursesData.status === "success" && coursesData.cursos && Array.isArray(coursesData.cursos.cursos)) {
          fetchedCoursesArray = coursesData.cursos.cursos;
        } else if (coursesData.status === "success" && Array.isArray(coursesData.cursos)) {
          fetchedCoursesArray = coursesData.cursos;
        } else {
          throw new Error(coursesData.message || "Datos de cursos inválidos para búsqueda: La estructura del array de cursos no es la esperada.");
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
    if (loadingSearchData) return;

    if (searchTerm === '') {
      setFilteredCourses([]);
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();

      const results = allCourses.filter((course) => {
        const courseName = course.titulo ? String(course.titulo).toLowerCase() : '';
        const courseSubtitle = course.subtitulo ? String(course.subtitulo).toLowerCase() : '';
        const categoryName = course.categoria_id
          ? (categoryMap[course.categoria_id] || '').toLowerCase()
          : '';

        const match = (
          courseName.includes(lowercasedSearchTerm) ||
          courseSubtitle.includes(lowercasedSearchTerm) ||
          categoryName.includes(lowercasedSearchTerm)
        );
        return match;
      });
      setFilteredCourses(results);
    }
  }, [searchTerm, allCourses, categoryMap, loadingSearchData]);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearchActive(true); // Activar cuando se escribe
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true); // Activar cuando el input gana foco
  };

  const handleSearchBlur = () => {
    // Retrasa el cierre para dar tiempo al clic en los resultados.
    // Si no haces esto, al hacer clic en un ListItem, el TextField pierde el foco
    // antes de que el onClick del ListItem se dispare, cerrando el Paper.
    setTimeout(() => {
      setIsSearchActive(false);
      // Opcional: No limpiar searchTerm y filteredCourses aquí si quieres que
      // los resultados permanezcan visibles hasta que se escriba algo nuevo
      // o se haga focus de nuevo. Si quieres limpiar siempre, mantenlos.
      setSearchTerm('');
      setFilteredCourses([]);
    }, 100); // Pequeño retraso, ajustable si es necesario
  };

  // Eliminamos el useEffect que manejaba el clic fuera
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
  //       setIsSearchActive(false);
  //       setSearchTerm('');
  //       setFilteredCourses([]);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  const getCategoryName = (categoryId) => {
    return categoryMap[categoryId] || 'Categoría Desconocida';
  };

  const handleCourseClick = (course) => {
    navigate(`/curso/${course.id}`);
    setIsSearchActive(false); // Cierra los resultados al navegar
    setSearchTerm(''); // Limpia el término de búsqueda
    setFilteredCourses([]); // Limpia los resultados
  };

  const isNotHomePage = location.pathname !== '/';

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "65px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: 1,
          backgroundColor: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1200,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {isNotHomePage && (
            <IconButton onClick={handleGoHome} color="primary" aria-label="ir al inicio">
              <HomeIcon />
            </IconButton>
          )}
          <IconButton onClick={toggleDrawer(true)} color="inherit">
            <MenuIcon />
          </IconButton>
          <Box sx={{ position: 'relative' }}> {/* searchBoxRef ya no es necesario aquí */}
            <TextField
              sx={{ display: { xs: "none", md: "flex" } }}
              size="small"
              variant="outlined"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus} // <-- Agregado onFocus
              onBlur={handleSearchBlur}   // <-- Agregado onBlur
            />
            {isSearchActive && (searchTerm !== '' || (filteredCourses.length > 0 && !loadingSearchData)) && (
                <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 1300,
                      mt: 0.5,
                      maxHeight: '300px',
                      overflowY: 'auto',
                      boxShadow: 3,
                      backgroundColor: 'white',
                      minWidth: 600,
                      width: 'auto',
                    }}
                >
                    {loadingSearchData ? (
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" sx={{ ml: 1 }}>Cargando cursos y categorías...</Typography>
                        </Box>
                    ) : searchError ? (
                        <Alert severity="error" sx={{ m: 1 }}>
                            Error al cargar la búsqueda: {searchError}
                        </Alert>
                    ) : filteredCourses.length === 0 ? (
                        searchTerm !== '' ? (
                            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                No se encontraron resultados para "{searchTerm}".
                            </Typography>
                        ) : (
                            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                Escribe para buscar cursos por nombre o categoría.
                            </Typography>
                        )
                    ) : (
                        <List dense>
                            {filteredCourses.map((course) => (
                                <React.Fragment key={course.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={() => handleCourseClick(course)}
                                        // Importante: para que el onBlur no se dispare y cierre antes de hacer clic
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                                    component="span"
                                                    variant="body1"
                                                    color="text.primary"
                                                >
                                                    {course.titulo}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    sx={{ display: 'block', fontSize: '0.8rem' }}
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Categoría: {getCategoryName(course.categoria_id)}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            )}
          </Box>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: "row" }}
          alignItems="center"
          marginRight={1}
          gap={2}
        >
          {!user ? (
            <>
              <Button
                sx={{
                  border: "1px #F21C63 solid",
                  display: { xs: "none", md: "flex" },
                  width: "200px",
                  color: "#F21C63",
                  padding: "10px",
                }}
                color="primary"
                onClick={handleRegisterClick}
              >
                Registrarse
              </Button>
              <Button
                sx={{
                  backgroundColor: "#F21C63 ",
                  width: { xs: "120px", md: "200px" },
                  padding: { xs: "5px", md: "10px" },
                }}
                variant="contained"
                color="primary"
                onClick={handleLoginClick}
              >
                Ingresar
              </Button>
            </>
          ) : (
            <Box
              sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 2 }}
            >
              {(userRole === 1 || userRole === 2) && (
                <Tooltip title="Crear curso">
                  <IconButton
                    color="primary"
                    onClick={handleCreateCourseClick}
                    sx={{
                      border: '1px solid #1976d2',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      p: 0,
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      }
                    }}
                    aria-label="Crear nuevo curso"
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {(userRole === 1 || userRole === 2) && (
                <Tooltip title="Mis cursos">
                  <IconButton
                    color="primary"
                    onClick={handleMyCoursesClick}
                    sx={{
                      border: '1px solid #1976d2',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      p: 0,
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      }
                    }}
                    aria-label="Ir a mis cursos"
                  >
                    <BookIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Afiliado">
                <IconButton
                  color="secondary"
                  onClick={handleOpenAffiliatePopup}
                  sx={{
                    border: '1px solid #1976d2',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    p: 0,
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    }
                  }}
                >
                  <EmojiEventsIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Perfil">
                <TemporaryDrawer />
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
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