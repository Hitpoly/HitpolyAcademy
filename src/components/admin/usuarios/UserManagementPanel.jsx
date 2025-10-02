import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const API_BASE_URL = "https://apiacademy.hitpoly.com/ajax/";
const INACTIVATION_DAYS = 6;

const getUserTypeName = (idTipo) => {
  switch (idTipo) {
    case 1:
      return "Administrador";
    case 2:
      return "Profesor";
    case 3:
      return "Alumno";
    default:
      return "Desconocido";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha Inválida";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    return "Error de Formato";
  }
};

const UserManagementPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}getAllUserController.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getAllUser" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP! Estado: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        if (Array.isArray(data.clases)) {
          const usersWithNormalizedType = data.clases.map((user) => {
            return {
              ...user,
              estado:
                user.estado && typeof user.estado === "string"
                  ? user.estado.toLowerCase()
                  : user.estado === 1 || user.estado === true
                  ? "activo"
                  : "inactivo",
              tipoNombre: getUserTypeName(Number(user.id_tipo_usuario)),
            };
          });
          setUsers(usersWithNormalizedType);
        } else {
          throw new Error("Formato de datos de usuarios inesperado desde el servidor.");
        }
      } else {
        throw new Error(data.message || "Error al obtener usuarios.");
      }
    } catch (err) {
      setError(`Error al cargar usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayState = (user) => {
    const isAlumno = Number(user.id_tipo_usuario) === 3;
    const isManuallyActive = user.estado === "activo"; 
    if (user.estado === "inactivo") {
      return "inactivo";
    }

    if (isAlumno && user.fecha_de_registro) {
      const registrationDate = new Date(user.fecha_de_registro);
      const cutoffDate = new Date(
        registrationDate.getTime() + INACTIVATION_DAYS * 24 * 60 * 60 * 1000
      );
      const now = new Date();

      if (now > cutoffDate) {
        if (isManuallyActive) {
          return "activo";
        }
        return "inactivo";
      }
    }
    return user.estado;
  };

  const handleToggleChange = async (event, userId) => {
    const newEstadoToSave = event.target.checked ? "activo" : "inactivo";

    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((user) =>
        user.id === userId ? { ...user, estado: newEstadoToSave } : user
      );
      return updatedUsers;
    });

    setEditingUserId(userId);

    try {
      const payload = {
        accion: "editar",
        id: userId,
        estado: newEstadoToSave,
      };

      const response = await fetch(`${API_BASE_URL}editarUsuarioController.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await response.text();
        throw new Error(`Error HTTP! Fallo al actualizar el estado.`);
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Error al actualizar el estado del usuario.");
      }
    } catch (err) {
      setError(`Error al guardar estado: ${err.message}. Revirtiendo cambio.`);
      setUsers((prevUsers) => {
        const revertedUsers = prevUsers.map((user) =>
          user.id === userId
            ? { ...user, estado: newEstadoToSave === "activo" ? "inactivo" : "activo" }
            : user
        );
        return revertedUsers;
      });
    } finally {
      setEditingUserId(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchTerm.toLowerCase();
      const nombre = (user.nombre || "").toLowerCase();
      const apellido = (user.apellido || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const tipoNombre = (user.tipoNombre || "").toLowerCase();
      const numeroCelular = (user.numero_celular || "").toLowerCase();
      const estadoDisplay = getDisplayState(user); 

      return (
        nombre.includes(term) ||
        apellido.includes(term) ||
        email.includes(term) ||
        tipoNombre.includes(term) ||
        numeroCelular.includes(term) ||
        estadoDisplay.includes(term)
      );
    });
  }, [users, searchTerm]);

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración de Usuarios 🛠️
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* --- */}

      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          label="Buscar usuario"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: "auto" }, minWidth: "250px" }}
        />
      </Box>

      {/* --- */}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 && searchTerm === "" ? (
        <Alert severity="info">No se encontraron usuarios. 🤷‍♂️</Alert>
      ) : filteredUsers.length === 0 && searchTerm !== "" ? (
        <Alert severity="info">
          No se encontraron usuarios que coincidan con "{searchTerm}". 🔍
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Número de Celular</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const displayState = getDisplayState(user);
                  const isChecked = displayState === "activo";
                  const isAlumnoInactivoByTime =
                    Number(user.id_tipo_usuario) === 3 &&
                    user.estado === "inactivo" &&
                    displayState === "inactivo";
                  const isManuallySuspended =
                    user.estado === "inactivo" &&
                    displayState === "inactivo";

                  return (
                    <TableRow
                      key={user.id}
                      sx={{
                        backgroundColor:
                          isAlumnoInactivoByTime && !isManuallySuspended
                            ? "rgba(255, 179, 0, 0.1)"
                            : "inherit",
                      }}
                    >
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.nombre}</TableCell>
                      <TableCell>{user.apellido}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.numero_celular}</TableCell>
                      <TableCell>{user.tipoNombre}</TableCell>
                      <TableCell>{formatDate(user.fecha_de_registro)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isChecked}
                                onChange={(event) =>
                                  handleToggleChange(event, user.id)
                                }
                                color="primary"
                                disabled={editingUserId === user.id || loading}
                              />
                            }
                            label={
                              <>
                                {displayState === "activo" ? (
                                  "Activo"
                                ) : (
                                  <span style={{ color: "red", fontWeight: "bold" }}>
                                    Inactivo
                                  </span>
                                )}
                                {displayState === "inactivo" &&
                                  Number(user.id_tipo_usuario) === 3 &&
                                  user.estado === "activo" &&
                                  " (Auto)"}
                              </>
                            }
                          />
                          {editingUserId === user.id && (
                            <CircularProgress size={20} sx={{ ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200, 500]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </>
      )}
    </Box>
  );
};

export default UserManagementPanel;