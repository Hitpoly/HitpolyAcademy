import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from "@mui/material"; 
import { useNavigate, useLocation } from "react-router-dom";
import CourseStatusManager from "./cursosCardsProfesor/CourseStatusManager"; 
import { useAuth } from "../../../../context/AuthContext";

const CourseListManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [forceRefreshCourseList, setForceRefreshCourseList] = useState(0);
  const { user, userRole, userCargo } = useAuth();
  
  const role = Number(userRole);
  const cargo = Number(userCargo);
  const isAdmin = role === 1;
  const isEmpresario = role === 2;
  const isProfesorAutorizado = role === 3 && cargo === 159;
  const puedeGestionar = isAdmin || isEmpresario || isProfesorAutorizado;

  const [initLoading, setInitLoading] = useState(false);
  const [initLogs, setInitLogs] = useState([]);
  const [initDialogOpen, setInitDialogOpen] = useState(false);

  useEffect(() => {
    if (location.state?.shouldRefresh) {
      setForceRefreshCourseList((prev) => prev + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleEditCourseFromList = (cursoRecibido) => {  
    navigate("/datos-de-curso", { state: { courseToEdit: cursoRecibido } });
  };

  const handleCreateNewCourse = () => {
    navigate("/datos-de-curso");
  };

  const handleInitOffers = async () => {
    setInitLoading(true);
    setInitDialogOpen(true);
    setInitLogs([]);
    try {
      const response = await fetch("https://apiacademy.hitpoly.com/ajax/ofertasController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "initOfertas", profesor_id: user?.id || 7 }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setInitLogs(data.logs || ["Ofertas inicializadas con éxito."]);
      } else {
        setInitLogs([`Error: ${data.message}`]);
      }
    } catch (err) {
      setInitLogs([`Error de conexión: ${err.message}`]);
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "white",
        boxShadow: 3,
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        align="center"
        sx={{ mb: 3 }}
      >
        {puedeGestionar ? "Gestionar Cursos Existentes" : "Mis Cursos Inscritos"}
      </Typography>

      {puedeGestionar && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewCourse}
          >
            Crear Nuevo Curso
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleInitOffers}
          >
            Inicializar Ofertas Globales
          </Button>
        </Box>
      )}

      <CourseStatusManager
        onEditCourse={handleEditCourseFromList} 
        refreshTrigger={forceRefreshCourseList} 
      />

      <Dialog open={initDialogOpen} onClose={() => setInitDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Inicializando Ofertas</DialogTitle>
        <DialogContent dividers>
          {initLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3} flexDirection="column">
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Generando tablas y asignando ofertas por defecto...</Typography>
            </Box>
          ) : (
            <Box>
              {initLogs.map((log, index) => (
                <Alert key={index} severity={log.startsWith("Error") ? "error" : "success"} sx={{ mb: 1 }}>
                  {log}
                </Alert>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInitDialogOpen(false)} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseListManager;