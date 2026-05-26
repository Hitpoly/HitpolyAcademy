import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, Typography, CircularProgress, Alert, Grid, 
  FormControl, InputLabel, Select, MenuItem, 
  Slider, FormControlLabel, Checkbox, Paper, Button,
  Divider, InputAdornment, OutlinedInput
} from "@mui/material";
import { useParams } from "react-router-dom";
import { FilterList, LocalOffer, CardGiftcard, AttachMoney } from "@mui/icons-material";
import CursoCard from "../cards/CursoCard";

const CourseCategory = () => {
  const { categoryName } = useParams();
  const isAll = categoryName.toLowerCase() === "todas";
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instructorNamesMap, setInstructorNamesMap] = useState({});
  const [categoryDescription, setCategoryDescription] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  // Filter States
  const [filterPrice, setFilterPrice] = useState([0, 1000]);
  const [filterOnlyOffers, setFilterOnlyOffers] = useState(false);
  const [filterOnlyFree, setFilterOnlyFree] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterOfferValue, setFilterOfferValue] = useState("Todas");
  const [filterFastCourses, setFilterFastCourses] = useState(false);

  useEffect(() => {
    const fetchCategoryCourses = async () => {
      setLoading(true);
      setError(null);
      setCourses([]);
      setInstructorNamesMap({});
      setCategoryDescription("");

      try {
        const categoriesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/GetCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!categoriesResponse.ok) throw new Error("Error al cargar categorías");
        const categoriesData = await categoriesResponse.json();
        setAllCategories(categoriesData.categorias || []);

        let foundCategory = null;
        if (!isAll) {
          foundCategory = categoriesData.categorias.find(
            (cat) => cat.nombre.toLowerCase() === categoryName.toLowerCase()
          );
          if (!foundCategory) {
            setError(`No se encontró la categoría "${categoryName}".`);
            setLoading(false);
            return;
          }
          if (foundCategory.descripcion) setCategoryDescription(foundCategory.descripcion);
        } else {
          setCategoryDescription("Explora todos los cursos disponibles en Hitpoly Academy y encuentra el ideal para ti.");
          setFilterCategory("Todas");
        }

        const coursesResponse = await fetch(
          "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getCursos" }),
          }
        );

        if (!coursesResponse.ok) throw new Error("Error al cargar cursos");
        const coursesData = await coursesResponse.json();
        let allFetchedCourses = [];

        if (coursesData.status === "success") {
          allFetchedCourses = coursesData.cursos?.cursos || coursesData.cursos || [];
        }

        // Filtrar por categoría si no es "Todas" (ignorando mayúsculas y espacios en el estado)
        const categoryFiltered = allFetchedCourses.filter(c => {
          const status = String(c.estado || "").trim().toLowerCase();
          const isPublished = status === "publicado";
          
          if (!isPublished) return false;

          if (isAll) return true;

          return String(c.categoria_id) === String(foundCategory.id);
        });

        const uniqueInstructorIds = [...new Set(categoryFiltered.map(c => c.profesor_id))].filter(id => id);

        const instructorPromises = uniqueInstructorIds.map(async (id) => {
          try {
            const res = await fetch("https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accion: "getAlumnoProfesor", id }),
            });
            const data = await res.json();
            return { id, name: data.status === "success" ? `${data.usuario.nombre} ${data.usuario.apellido}` : "Instructor Desconocido" };
          } catch { return { id, name: "Instructor Desconocido" }; }
        });

        const instructors = await Promise.all(instructorPromises);
        const newMap = instructors.reduce((map, inst) => ({ ...map, [inst.id]: inst.name }), {});
        setInstructorNamesMap(newMap);

        const coursesWithExtraData = await Promise.all(
          categoryFiltered.map(async (curso) => {
            const valRes = await fetch(`https://apiacademy.hitpoly.com/ajax/valoracionesController.php?accion=getResumen&curso_id=${curso.id}`).catch(() => null);
            const valData = valRes ? await valRes.json() : { status: "error" };

            return {
              id: curso.id,
              title: curso.titulo,
              subtitle: curso.subtitulo,
              banner: curso.portada_targeta,
              videoUrl: curso.url_video_introductorio,
              accessLink: `/curso/${curso.id}`,
              instructorName: newMap[curso.profesor_id] || "Instructor Academia",
              totalHours: curso.duracion_estimada,
              priceValue: parseFloat(curso.precio) || 0,
              currency: curso.moneda,
              price: `${curso.precio} ${curso.moneda}`,
              rating: valData.status === "success" ? valData.rating : 0,
              reviews: valData.status === "success" ? valData.reviews : 0,
              level: curso.level,
              classType: curso.tipo_clase,
              categoria_id: curso.categoria_id,
              hasOffer: !!curso.oferta && (parseFloat(curso.oferta.precio_oferta) > 0 || parseFloat(curso.oferta.descuento) > 0),
              isFree: parseFloat(curso.precio) === 0,
              oferta: curso.oferta,
              students: curso.total_estudiantes || 0
            };
          })
        );

        setCourses(coursesWithExtraData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCourses();
  }, [categoryName, isAll]);

  // Extraer descuentos únicos para el sub-filtro
  const availableDiscountLevels = useMemo(() => {
    const discounts = new Set();
    courses.forEach(c => {
      if (c.hasOffer && c.oferta && c.oferta.descuento) {
        discounts.add(parseFloat(c.oferta.descuento));
      }
    });
    return Array.from(discounts).sort((a, b) => b - a); // De mayor a menor
  }, [courses]);

  // Logic for filtered courses
  const displayedCourses = useMemo(() => {
    return courses.filter(curso => {
      // Calcular precio final (con oferta si existe) para el filtro de precio
      let finalPriceValue = curso.priceValue;
      if (curso.hasOffer && curso.oferta) {
        if (curso.oferta.precio_oferta && parseFloat(curso.oferta.precio_oferta) > 0) {
          finalPriceValue = parseFloat(curso.oferta.precio_oferta);
        } else if (curso.oferta.descuento && parseFloat(curso.oferta.descuento) > 0) {
          finalPriceValue = curso.priceValue - (curso.priceValue * (parseFloat(curso.oferta.descuento) / 100));
        }
      }

      // Precio: Si es 1000, consideramos que es "o más"
      const matchesPrice = finalPriceValue >= filterPrice[0] && 
                          (filterPrice[1] >= 1000 ? true : finalPriceValue <= filterPrice[1]);
      
      // Lógica de "Ofertas" y "Gratis": Si ambos están marcados, es un OR (mostrar cualquiera de los dos)
      let matchesSpecial = true;
      if (filterOnlyOffers || filterOnlyFree) {
        const matchesOfferBase = filterOnlyOffers && curso.hasOffer;
        const matchesFreeBase = filterOnlyFree && curso.isFree;
        
        // Si hay un nivel de oferta específico seleccionado
        let matchesSpecificOffer = true;
        if (filterOnlyOffers && filterOfferValue !== "Todas") {
          // Comparación numérica para evitar errores de formato (20.00 vs 20)
          matchesSpecificOffer = curso.hasOffer && curso.oferta && 
                                parseFloat(curso.oferta.descuento) === parseFloat(filterOfferValue);
        }

        matchesSpecial = (matchesOfferBase && matchesSpecificOffer) || matchesFreeBase;
      }

      const matchesCategory = (isAll && filterCategory !== "Todas") 
        ? String(curso.categoria_id) === String(filterCategory)
        : true;
      
      // Filtro de Cursos Rápidos (Duración <= 10 horas)
      let matchesFast = true;
      if (filterFastCourses) {
        const hours = parseFloat(curso.totalHours);
        matchesFast = !isNaN(hours) && hours <= 10;
      }
      
      return matchesPrice && matchesSpecial && matchesCategory && matchesFast;
    });
  }, [courses, filterPrice, filterOnlyOffers, filterOnlyFree, filterCategory, filterOfferValue, filterFastCourses, isAll]);

  const handleResetFilters = () => {
    setFilterPrice([0, 1000]);
    setFilterOnlyOffers(false);
    setFilterOnlyFree(false);
    setFilterCategory("Todas");
    setFilterOfferValue("Todas");
    setFilterFastCourses(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 80px)", mt: "80px" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando cursos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, mt: "80px" }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Banner */}
      <Box
        sx={{
          backgroundColor: "#2D1638",
          color: "white",
          p: { xs: "30px 20px", md: "40px 60px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "160px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
          HitpolyAcademy | Explorar Cursos
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", "& span": { color: "#f21c63" } }}>
          {isAll ? "Todos los" : "Cursos de"} <span>{isAll ? "Cursos" : categoryName}</span>
        </Typography>
        {categoryDescription && (
          <Typography variant="body2" sx={{ maxWidth: "80%", opacity: 0.9 }}>
            {categoryDescription}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Horizontal Filter Bar */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
            flexWrap: "wrap"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: "fit-content" }}>
            <FilterList color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Filtrar por:</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

          {/* Categoría Selector (solo si es "Todas") */}
          {isAll && (
            <FormControl size="small" sx={{ minWidth: 200, flexGrow: { xs: 1, md: 0 } }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                label="Categoría"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="Todas">Todas las categorías</MenuItem>
                {allCategories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Precio Slider Area - Ancho reducido */}
          <Box sx={{ width: 220, px: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Rango de Precio: ${filterPrice[0]} - ${filterPrice[1] === 1000 ? "1000+" : filterPrice[1]}
            </Typography>
            <Slider
              value={filterPrice}
              onChange={(e, newValue) => setFilterPrice(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              size="small"
              sx={{ color: "#f21c63", mt: 1 }}
            />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

          {/* Checkboxes */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={filterOnlyOffers} onChange={(e) => setFilterOnlyOffers(e.target.checked)} sx={{ '&.Mui-checked': { color: '#f21c63' } }} />}
              label={<Typography variant="caption" fontWeight="bold">Solo Ofertas</Typography>}
            />
            
            {/* Sub-filtro de ofertas específicas */}
            {filterOnlyOffers && availableDiscountLevels.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150, ml: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Variedad de Oferta</InputLabel>
                <Select
                  label="Variedad de Oferta"
                  value={filterOfferValue}
                  onChange={(e) => setFilterOfferValue(e.target.value)}
                  sx={{ fontSize: '0.75rem', height: '32px' }}
                >
                  <MenuItem value="Todas" sx={{ fontSize: '0.75rem' }}>Ver todas</MenuItem>
                  {availableDiscountLevels.map(level => (
                    <MenuItem key={level} value={level} sx={{ fontSize: '0.75rem' }}>
                      {level}% off
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={<Checkbox size="small" checked={filterOnlyFree} onChange={(e) => setFilterOnlyFree(e.target.checked)} sx={{ '&.Mui-checked': { color: '#f21c63' } }} />}
              label={<Typography variant="caption" fontWeight="bold">Gratis</Typography>}
            />

            <FormControlLabel
              control={<Checkbox size="small" checked={filterFastCourses} onChange={(e) => setFilterFastCourses(e.target.checked)} sx={{ '&.Mui-checked': { color: '#f21c63' } }} />}
              label={<Typography variant="caption" fontWeight="bold">Cursos Rápidos</Typography>}
            />
          </Box>

          <Button 
            variant="text" 
            size="small"
            onClick={handleResetFilters}
            sx={{ textTransform: "none", color: "#666", fontWeight: "bold" }}
          >
            Limpiar
          </Button>
        </Paper>

        {/* Results Area */}
        <Box sx={{ mb: 2, px: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando <strong>{displayedCourses.length}</strong> cursos encontrados
          </Typography>
        </Box>

        {displayedCourses.length > 0 ? (
          <Grid container spacing={3}>
            {displayedCourses.map((curso) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={curso.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '340px' } }}>
                  <CursoCard {...curso} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 5, textAlign: "center", borderRadius: 4, bgcolor: "rgba(0,0,0,0.02)", border: "2px dashed #ddd" }}>
            <Typography variant="h6" color="text.secondary">No se encontraron cursos con estos filtros</Typography>
            <Button onClick={handleResetFilters} sx={{ mt: 2, color: "#f21c63" }}>Ver todos los cursos</Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CourseCategory;
