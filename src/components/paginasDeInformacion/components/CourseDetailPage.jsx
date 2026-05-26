import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, useMediaQuery, useTheme } from "@mui/material";
import { CheckCircleOutline as CheckIcon, LibraryBooks as ModuleIcon, Class as ClassIcon, AccessTime, Person, MonetizationOn, OndemandVideo, ShoppingCart, PlayCircleOutline as PlayCircleOutlineIcon } from "@mui/icons-material";
import VideoPlayerWithControls from "../../videos/VideoPlayerWithControls";
import CountdownBanner from "../../cronometro/CountdownBanner";
import RelatedCoursesList from "../../sections/related/RelatedCoursesList";
import { useAuth } from "../../../context/AuthContext";
import OfferDialog from "../../forms/cursoForm/OfferDialog";

const CourseDetailPage = ({ course, countdownTargetDate, externalOfferOpen, setExternalOfferOpen, initialIsInCart, onCartChange }) => {
  const [showAllOutcomes, setShowAllOutcomes] = useState(false);
  const [showAllModules, setShowAllModules] = useState(false);

  // Cart State
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const [isInCart, setIsInCart] = useState(initialIsInCart);

  useEffect(() => {
    setIsInCart(initialIsInCart);
  }, [initialIsInCart]);

  const theme = useTheme();
  const isDesktop = useMediaQuery("(min-width:1300px)");

  // Log para depuración de ancho de pantalla
  useEffect(() => {
    const handleResize = () => {
      // console.log("[DEBUG ANCHO] Window width:", window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  useEffect(() => {
    if (externalOfferOpen) {
      setOfferDialogOpen(true);
    }
  }, [externalOfferOpen]);

  const handleCloseOffer = () => {
    setOfferDialogOpen(false);
    if (setExternalOfferOpen) setExternalOfferOpen(false);
  };

  const handleAprovecharPrueba = () => {
    handleCloseOffer();
    navigate(`/master-full/${course.id}`);
  };

  const handleGoToCart = (e) => {
    if (e) e.preventDefault();
    console.log("[ACADEMY] handleGoToCart clicked");

    // Enviar mensaje al padre (Holding) para abrir el carrito sin recargar
    if (window.self !== window.top) {
      window.top.postMessage({ type: 'OPEN_CART' }, '*');
    } else {
      window.location.href = "https://hitpoly.com/?cart=open";
    }
  };


  if (!course) return <Typography variant="h6">Cargando...</Typography>;

  // Helper para el precio con oferta
  let priceDisplay = course.price;
  if (course.oferta && course.price) {
    const originalPrice = parseFloat(course.price);
    if (!isNaN(originalPrice)) {
      if (course.oferta.precio_oferta && parseFloat(course.oferta.precio_oferta) > 0) {
        priceDisplay = (
          <Box component="span">
            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>${originalPrice}</span>
            <span style={{ color: "#F21C63", fontWeight: "bold" }}>${course.oferta.precio_oferta}</span>
          </Box>
        );
      } else if (course.oferta.descuento && parseFloat(course.oferta.descuento) > 0) {
        const newPrice = originalPrice - (originalPrice * (course.oferta.descuento / 100));
        priceDisplay = (
          <Box component="span">
            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>${originalPrice}</span>
            <span style={{ color: "#F21C63", fontWeight: "bold" }}>${newPrice.toFixed(2)} (-{course.oferta.descuento}%)</span>
          </Box>
        );
      }
    }
  }

  // Configuración de chips
  const chips = [
    { icon: <Person />, label: `Instructor: ${course.instructor}` },
    { icon: <AccessTime />, label: `Duración: ${course.duration}` },
    { icon: <OndemandVideo />, label: `Nivel: ${course.level}`, color: "primary" },
    ...(course.price ? [{ icon: <MonetizationOn />, label: priceDisplay, color: course.oferta ? "default" : "success" }] : [])
  ];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setCartMessage({ type: "warning", text: "Debes iniciar sesión para añadir cursos al carrito." });
      setCartDialogOpen(true);
      return;
    }
    setCartLoading(true);
    try {
      const originalPrice = parseFloat(course.price) || 0;
      const finalPrice = course.oferta?.precio_oferta
        ? parseFloat(course.oferta.precio_oferta)
        : course.oferta?.descuento
          ? originalPrice - (originalPrice * course.oferta.descuento / 100)
          : originalPrice;

      const res = await fetch("https://apiweb.hitpoly.com/ajax/carritoController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accion: "addItem",
          usuario_id: user?.id || user?.user_id,
          producto_id: course.id,
          tipo: "curso",
          nombre: course.title,
          descripcion: course.description?.substring(0, 200) || "",
          imagen: course.portada_targeta || "",
          precio_original: originalPrice,
          precio_final: parseFloat(finalPrice.toFixed(2)),
          fecha_oferta: course.oferta?.fecha_fin || null,
          origen: "academy"
        }),
      });
      const data = await res.json();
      setCartMessage({ type: data.status || "error", text: data.message });
      
      if (data.status === "success" || data.status === "info") {
        setIsInCart(true);
        if (onCartChange) onCartChange(true);
        setOfferDialogOpen(false); // Cierra el popup de oferta automáticamente
        // Abrir drawer en el padre
        if (window.self !== window.top) {
          window.top.postMessage({ type: 'OPEN_CART' }, '*');
        }
      } else {
        setCartDialogOpen(true); // Mostrar error si falla
      }
    } catch (err) {
      setCartMessage({ type: "error", text: "Error de conexión. Intenta de nuevo." });
      setCartDialogOpen(true);
    } finally {
      setCartLoading(false);
    }
  };

  // Helper para botones "Ver más"
  const ExpandButton = ({ toggle, isOpen, labelOn, labelOff }) => (
    <Button onClick={() => toggle(!isOpen)} variant="text" sx={{ textTransform: "none", p: 0, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}>
      {isOpen ? labelOff : labelOn}
    </Button>
  );

  return (
    <Container sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        {/* Video y Chips */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ pb: { xs: 2, md: 4 }, mx: { xs: -2, md: -4 }, mt: { xs: -2, md: -4 } }}>
            <VideoPlayerWithControls videoUrl={course.inductionVideoUrl} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{
          display: "flex",
          flexDirection: isDesktop ? "row" : "column",
          gap: 4,
          mb: 5
        }}>
          {/* Contenido principal a la izquierda */}
          <Box sx={{
            width: isDesktop ? "66%" : "100%",
            order: isDesktop ? 1 : 1
          }}>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" gutterBottom>¿Qué aprenderás en este curso?</Typography>
              <List>
                {(showAllOutcomes ? course.learningOutcomes : course.learningOutcomes?.slice(0, 3))?.map((item, i) => (
                  <Paper key={i} elevation={2} sx={{ mb: 2, p: 2 }}>
                    <ListItem disablePadding>
                      <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  </Paper>
                ))}
              </List>
              {course.learningOutcomes?.length > 3 && (
                <ExpandButton toggle={setShowAllOutcomes} isOpen={showAllOutcomes} labelOn="Ver más temas" labelOff="Ocultar temas" />
              )}
            </Box>

            {/* Módulos */}
            {course.modules?.length > 0 && (
              <Box sx={{ mb: 5 }}>
                <Typography variant="h6" gutterBottom>Contenido del Curso</Typography>
                {(showAllModules ? course.modules : course.modules.slice(0, 2)).map((mod, i) => (
                  <Paper key={i} elevation={2} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <ModuleIcon color="action" sx={{ mr: 2 }} />
                      <Typography variant="subtitle1" fontWeight="bold">Módulo {i + 1}: {mod.title}</Typography>
                    </Box>
                    <List dense sx={{ pl: 4 }}>
                      {mod.clases?.map((clase, j) => (
                        <ListItem key={j} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}><PlayCircleOutlineIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary={clase.nombre} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                ))}
                {course.modules.length > 2 && (
                  <ExpandButton toggle={setShowAllModules} isOpen={showAllModules} labelOn="Ver más módulos" labelOff="Ocultar módulos" />
                )}
              </Box>
            )}
          </Box>

          {/* Sidebar a la derecha */}
          <Box sx={{
            width: isDesktop ? "34%" : "100%",
            order: isDesktop ? 2 : 2
          }}>
            <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2, border: "1px solid #eee" }}>
              <RelatedCoursesList 
                currentCourseId={course.id} 
                categoriaId={course.categoria_id} 
                profesorId={course.profesor_id}
                isStacked={!isDesktop}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ===== DIALOG CARRITO ===== */}
      <Dialog
        open={cartDialogOpen}
        onClose={() => { setCartDialogOpen(false); setCartMessage(null); }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Header degradado */}
        <Box sx={{ background: "linear-gradient(135deg, #1a0533 0%, #F21C63 100%)", p: 3, color: "white", textAlign: "center" }}>
          <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">🌞 Oferta de Verano</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{course.title}</Typography>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {cartMessage ? (
            <Alert severity={cartMessage.type} sx={{ mb: 2 }}>{cartMessage.text}</Alert>
          ) : isInCart ? (
            <Alert severity="info" sx={{ mb: 2 }}>Este producto ya está en tu carrito.</Alert>
          ) : null}

          {/* Desglose del precio */}
          <Box sx={{ bgcolor: "#f9f9f9", borderRadius: 2, p: 2.5, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Precio original:</Typography>
              <Typography sx={{ textDecoration: "line-through", color: "#999" }}>${parseFloat(course.price).toFixed(2)}</Typography>
            </Box>
            {course.oferta?.descuento && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="text.secondary">Descuento ({course.oferta.descuento}%):</Typography>
                <Typography color="error.main" fontWeight="bold">
                  -${(parseFloat(course.price) * course.oferta.descuento / 100).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #e0e0e0" }}>
              <Typography fontWeight="bold" variant="subtitle1">Total:</Typography>
              <Typography fontWeight="bold" variant="h6" color="#F21C63">
                ${course.oferta?.precio_oferta
                  ? parseFloat(course.oferta.precio_oferta).toFixed(2)
                  : (parseFloat(course.price) - (parseFloat(course.price) * (course.oferta?.descuento || 0) / 100)).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {course.oferta?.fecha_fin && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
              ⏳ Oferta válida hasta: {new Date(course.oferta.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0, flexDirection: "column", gap: 1 }}>
          {['success', 'info'].includes(cartMessage?.type) || isInCart ? (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGoToCart}
                sx={{ bgcolor: "#F21C63", "&:hover": { bgcolor: "#d41857" }, borderRadius: 2, py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
              >
                💳 Ir a Pagar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setCartDialogOpen(false);
                  setCartMessage(null);
                  navigate("/");
                }}
                sx={{ borderRadius: 2, py: 1.2, fontWeight: "bold", color: "#F21C63", borderColor: "#F21C63", "&:hover": { borderColor: "#d41857", bgcolor: "rgba(242, 28, 99, 0.04)" } }}
              >
                📚 Seguir comprando mas cursos
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={cartLoading ? <CircularProgress size={18} color="inherit" /> : <ShoppingCart />}
                disabled={cartLoading}
                onClick={handleAddToCart}
                sx={{ bgcolor: "#F21C63", "&:hover": { bgcolor: "#d41857" }, borderRadius: 2, py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
              >
                {cartLoading ? "Añadiendo..." : "🛒 Añadir al Carrito"}
              </Button>
              <Button fullWidth variant="text" onClick={() => { setCartDialogOpen(false); setCartMessage(null); }} sx={{ color: "text.secondary" }}>
                Cancelar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <OfferDialog 
        open={offerDialogOpen}
        onClose={handleCloseOffer}
        onAprovecharPrueba={handleAprovecharPrueba}
        course={course}
        isInCart={isInCart}
        handleGoToCart={handleGoToCart}
        handleAddToCart={handleAddToCart}
        cartLoading={cartLoading}
      />
    </Container>
  );
};

export default CourseDetailPage;