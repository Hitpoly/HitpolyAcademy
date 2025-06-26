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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ListaDeNombres from "./components/MenuHamburguesa"; // Este debería ser tu ListaDeCategorias
import TemporaryDrawer from "./components/drawer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SequencePopup from "../../components/popups/SequencePopup";
import CategoryCoursesPopup from "../categorias/CoursesByCategory"; // <--- IMPORTA EL POPUP DE CATEGORÍAS

// Define los pasos específicos para la secuencia del popup "Soy Afiliado"
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

const MenuDeNavegacion = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAffiliatePopupOpen, setIsAffiliatePopupOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Estados para el Popup de Categorías ---
  const [isCategoryCoursesPopupOpen, setIsCategoryCoursesPopupOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Para almacenar el ID de la categoría seleccionada

  // --- Estados y Refs para la Búsqueda ---
  const [searchTerm, setSearchTerm] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loadingSearchData, setLoadingSearchData] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const searchBoxRef = useRef(null);

  // --- Funciones del Menú Principal ---
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
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
    console.log("Secuencia de afiliado completada.");
    handleCloseAffiliatePopup();
  };

  // --- Lógica para la Carga de Datos de Búsqueda (Cursos y Categorías) ---
  useEffect(() => {
    const fetchDataForSearch = async () => {
      setLoadingSearchData(true);
      setSearchError(null);
      try {
        console.log("Iniciando carga de datos para búsqueda...");
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
        console.log("Datos de categorías cargados:", categoriesData);
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
        console.log("CategoryMap generado:", newCategoryMap);

        // Procesamiento de Cursos
        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          throw new Error(
            `Error al cargar cursos: ${coursesResponse.statusText}. Detalles: ${errorText}`
          );
        }
        const coursesData = await coursesResponse.json();
        console.log("Datos de cursos cargados:", coursesData);
        if (
          coursesData.status !== "success" ||
          !coursesData.cursos ||
          !Array.isArray(coursesData.cursos.cursos)
        ) {
          throw new Error(
            coursesData.message ||
            "Datos de cursos inválidos: la propiedad 'cursos' no es un array en la ubicación esperada."
          );
        }

        const publishedCourses = coursesData.cursos.cursos.filter(
          (curso) => curso.estado === "Publicado"
        );
        setAllCourses(publishedCourses);
        console.log("Cursos publicados cargados:", publishedCourses);

      } catch (err) {
        console.error('Error general al cargar datos para búsqueda:', err);
        setSearchError(err.message);
      } finally {
        setLoadingSearchData(false);
        console.log("Carga de datos de búsqueda finalizada.");
      }
    };

    fetchDataForSearch();
  }, []);

  // --- Lógica de Filtrado de Búsqueda ---
  useEffect(() => {
    if (loadingSearchData) return;

    console.log("useEffect de filtrado activado. SearchTerm:", searchTerm);
    if (searchTerm === '') {
      setFilteredCourses([]);
      console.log("SearchTerm vacío, filteredCourses se vacía.");
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      console.log("SearchTerm en minúsculas:", lowercasedSearchTerm);

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

        if (match) {
            console.log(`Coincidencia encontrada para "${lowercasedSearchTerm}" en:`, {
                id: course.id,
                titulo: course.titulo,
                subtitulo: course.subtitulo,
                categoria: getCategoryName(course.categoria_id),
                matchedBy: {
                    name: courseName.includes(lowercasedSearchTerm),
                    subtitle: courseSubtitle.includes(lowercasedSearchTerm),
                    category: categoryName.includes(lowercasedSearchTerm)
                }
            });
        }
        return match;
      });
      setFilteredCourses(results);
      console.log("Cursos filtrados:", results);
    }
  }, [searchTerm, allCourses, categoryMap, loadingSearchData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearchActive(true);
    console.log("Search term cambiado a:", event.target.value);
  };

  const handleSearchFocus = () => {
    // Si ya hay un término de búsqueda, al enfocar se vuelven a mostrar los resultados
    if (searchTerm !== '') {
        setIsSearchActive(true);
        console.log("Campo de búsqueda enfocado y activo (con término existente).");
    } else {
        // Si el searchTerm está vacío, no se activará el popup automáticamente solo al enfocar.
        // Solo se activará cuando empiece a escribir.
        console.log("Campo de búsqueda enfocado, pero término de búsqueda vacío.");
    }
  };

  // Cierra los resultados de búsqueda Y limpia el input al hacer clic fuera del cuadro de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsSearchActive(false);
        setSearchTerm(''); // Limpia el término de búsqueda
        setFilteredCourses([]); // Asegura que también se vacíen los resultados en el estado
        console.log("Clic fuera, resultados de búsqueda ocultos y campo limpiado.");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCategoryName = (categoryId) => {
    return categoryMap[categoryId] || 'Categoría Desconocida';
  };

  const handleCourseClick = (course) => {
      console.log("Curso clickeado, navegando a ID:", course.id);
      navigate(`/curso/${course.id}`);
      setIsSearchActive(false); // Cierra los resultados
      setSearchTerm(''); // Limpia el campo de búsqueda
      setFilteredCourses([]); // Limpia los cursos filtrados
  };

  // --- Funciones para el Popup de Categorías ---
  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setDrawerOpen(false); // Cierra el Drawer al seleccionar una categoría
    setIsCategoryCoursesPopupOpen(true); // Abre el popup de cursos de categoría
    console.log("Categoría seleccionada:", categoryId);
  };

  const handleCloseCategoryCoursesPopup = () => {
    setIsCategoryCoursesPopupOpen(false);
    setSelectedCategoryId(null); // Resetea el ID de categoría seleccionada
  };

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "64px",
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
          <IconButton onClick={toggleDrawer(true)} color="inherit">
            <MenuIcon />
          </IconButton>
          <Box sx={{ position: 'relative' }} ref={searchBoxRef}>
            <TextField
              sx={{ display: { xs: "none", md: "flex" } }}
              size="small"
              variant="outlined"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {/* Solo muestra el Paper si isSearchActive es true Y (hay un término de búsqueda O hay resultados filtrados y no está cargando) */}
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
                      minWidth: 550,
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
              <TemporaryDrawer />
            </Box>
          )}
        </Box>
      </Box>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width:250 }}
          role="presentation"
          onClick={toggleDrawer(false)} // Cierra el drawer al hacer clic en cualquier parte del Box
        >
          {/* PASA LA FUNCIÓN handleSelectCategory A ListaDeNombres (ListaDeCategorias) */}
          <ListaDeNombres onSelectCategory={handleSelectCategory} />
        </Box>
      </Drawer>

      <SequencePopup
        steps={affiliateSteps}
        isOpen={isAffiliatePopupOpen}
        onClose={handleCloseAffiliatePopup}
        onSequenceComplete={handleAffiliateSequenceComplete}
      />

      {/* RENDERIZA EL POPUP DE CATEGORÍAS AQUÍ */}
      <CategoryCoursesPopup
        isOpen={isCategoryCoursesPopupOpen}
        onClose={handleCloseCategoryCoursesPopup}
        selectedCategoryId={selectedCategoryId}
        categoryMap={categoryMap}
        allCourses={allCourses} // Pasamos todos los cursos para que el popup los filtre
        loading={loadingSearchData} // Puedes usar el mismo estado de carga si los datos son compartidos
        error={searchError}        // Puedes usar el mismo estado de error
      />
    </>
  );
};

export default MenuDeNavegacion;