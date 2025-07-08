// src/components/admin/AppTestimonios.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
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

      if (
        !commentsResponse.ok ||
        commentsData.status !== "success" ||
        !Array.isArray(commentsData.comentarios)
      ) {
        throw new Error(
          commentsData.message ||
            "La API de comentarios no devolvió una lista válida."
        );
      }
      
      commentsData.comentarios.forEach(comment => {
       });
      setAllCommentsFromApi(commentsData.comentarios);
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
    const newEditedDestacado = Number(comment.destacado) === 1 ? 1 : 0;

    setEditingCommentId(comment.id);
    setEditedContent(comment.contenido);
    setEditedDestacado(newEditedDestacado);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
    setEditedDestacado(0);
  };

  const handleSaveEditedReview = async (commentId) => {
    setLoading(true);
    setError(null);

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
        throw new Error(data.message || "Error al actualizar el comentario.");
      }
      setAllCommentsFromApi((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, contenido: editedContent, destacado: editedDestacado }
            : comment
        )
      );

      setEditingCommentId(null); 
      setEditedContent("");
      setEditedDestacado(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (commentId) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar el comentario con ID ${commentId}?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

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

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Error al eliminar el comentario.");
      }

      setAllCommentsFromApi((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración de Testimonios
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Desde aquí puedes **editar el contenido y el estado "destacado"** de
        cada comentario, o **eliminarlos** de forma permanente.
      </Typography>
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Comentarios disponibles:
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && allCommentsFromApi.length === 0 && (
        <Typography>No se encontraron comentarios para administrar.</Typography>
      )}
      {!loading && !error && allCommentsFromApi.length > 0 && (
        <FormGroup>
          {allCommentsFromApi.map((comment) => {
            const isDestacado = Number(comment.destacado) === 1;
            return (
              <Box
                key={comment.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  border: "1px solid #eee",
                  p: 1,
                  my: 0.5,
                  borderRadius: 1,
                  backgroundColor: isDestacado ? "#e6ffe6" : "transparent", 
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      **ID:** {comment.id} | **Usuario ID:**{" "}
                      {comment.usuario_id}
                      {usersById[comment.usuario_id]
                        ? ` (${
                            usersById[comment.usuario_id]?.nombre ||
                            "Nombre Desconocido"
                          })`
                        : ""}
                    </Typography>
                    {editingCommentId === comment.id ? (
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1, mb: 1 }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                        "{comment.contenido.length > 100
                          ? comment.contenido.substring(0, 100) + "..."
                          : comment.contenido}"
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ml: 1 }}>
                    {editingCommentId === comment.id ? (
                      <>
                        <IconButton
                          aria-label="guardar"
                          onClick={() => handleSaveEditedReview(comment.id)}
                          color="success"
                          size="small"
                          disabled={loading}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          aria-label="cancelar"
                          onClick={handleCancelEdit}
                          color="warning"
                          size="small"
                          disabled={loading}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        aria-label="editar"
                        onClick={() => handleEditReview(comment)}
                        color="info"
                        size="small"
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="eliminar"
                      onClick={() => handleDeleteReview(comment.id)}
                      color="error"
                      size="small"
                      disabled={loading || editingCommentId === comment.id}
                    >
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
                        disabled={loading}
                      />
                    }
                    label="Destacado"
                    sx={{ ml: 0, mt: 1 }}
                  />
                )}
                  {editingCommentId !== comment.id && ( 
                     <Typography variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                       Estado: {isDestacado ? "Destacado" : "Normal"}
                     </Typography>
                   )}
              </Box>
            );
          })}
        </FormGroup>
      )}
    </Box>
  );
};

export default AppTestimonios;