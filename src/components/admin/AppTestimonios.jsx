// src/components/admin/AppTestimonios.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const AppTestimonios = () => {
  const [allCommentsFromApi, setAllCommentsFromApi] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedDestacado, setEditedDestacado] = useState(0);

  const fetchCommentsAndUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const commentsResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getComentariosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getComentarios" }),
        }
      );
      const commentsData = await commentsResponse.json();

      if (!commentsResponse.ok || commentsData.status !== "success") {
        throw new Error(commentsData.message || "Error al cargar comentarios.");
      }

      // 1. Validamos que comentarios sea un array, si no, ponemos array vacío
      const validComments = Array.isArray(commentsData.comentarios) ? commentsData.comentarios : [];
      setAllCommentsFromApi(validComments);

      const allUsersResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/getAllUserController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "getAllUser" }),
        }
      );
      const allUsersData = await allUsersResponse.json();
      
      let mappedUsers = {};
      if (allUsersData.status === "success" && Array.isArray(allUsersData.clases)) {
        mappedUsers = allUsersData.clases.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }
      setUsersById(mappedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsAndUsers();
  }, []); 

  const handleEditReview = (comment) => {
    setEditingCommentId(comment.id);
    // 2. Aseguramos que el contenido no sea null al editar
    setEditedContent(comment.contenido || "");
    setEditedDestacado(Number(comment.destacado) === 1 ? 1 : 0);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
    setEditedDestacado(0);
  };

  const handleSaveEditedReview = async (commentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/editarComentariosController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "update",
            id: commentId,
            contenido: editedContent,
            destacado: editedDestacado,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Error al actualizar.");
      }

      setAllCommentsFromApi((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, contenido: editedContent, destacado: editedDestacado } : c))
      );
      setEditingCommentId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    setLoading(true);
    try {
      const response = await fetch(
        "https://apiacademy.hitpoly.com/ajax/eliminarComentarioController.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "delete", id: commentId }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setAllCommentsFromApi((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Panel de Administración de Testimonios
      </Typography>
      
      {loading && <CircularProgress sx={{ my: 2 }} />}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      
      {!loading && allCommentsFromApi.length === 0 && (
        <Typography>No hay comentarios.</Typography>
      )}

      <FormGroup>
        {allCommentsFromApi.map((comment) => {
          const isDestacado = Number(comment.destacado) === 1;
          // 3. Blindaje crítico: Si contenido es null, usamos string vacío para que .length no rompa
          const contenidoSeguro = comment.contenido || "";

          return (
            <Box
              key={comment.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid #eee",
                p: 2,
                my: 1,
                borderRadius: 2,
                backgroundColor: isDestacado ? "#f0fdf4" : "white",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    ID: {comment.id} | Usuario: {usersById[comment.usuario_id]?.nombre || "Anonimo"} (ID: {comment.usuario_id})
                  </Typography>

                  {editingCommentId === comment.id ? (
                    <TextField
                      fullWidth
                      multiline
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 1, fontStyle: "italic" }}>
                      "{contenidoSeguro.length > 100
                        ? contenidoSeguro.substring(0, 100) + "..."
                        : contenidoSeguro}"
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  {editingCommentId === comment.id ? (
                    <>
                      <IconButton onClick={() => handleSaveEditedReview(comment.id)} color="success">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleCancelEdit} color="error">
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => handleEditReview(comment)} color="primary">
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDeleteReview(comment.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {editingCommentId === comment.id && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editedDestacado === 1}
                      onChange={(e) => setEditedDestacado(e.target.checked ? 1 : 0)}
                    />
                  }
                  label="Marcar como Destacado"
                />
              )}
            </Box>
          );
        })}
      </FormGroup>
    </Box>
  );
};

export default AppTestimonios;