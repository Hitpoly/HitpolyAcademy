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
  const [loading, setLoading] = useState(true); // Estado de carga general
  const [error, setError] = useState(null); // Estado de error general

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedDestacado, setEditedDestacado] = useState(0);

  // Función para cargar los comentarios y usuarios
  const fetchCommentsAndUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener comentarios
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
      
      // --- LOG 1: Verificación de datos de comentarios recibidos ---
      console.log("--- Datos de comentarios recibidos de la API ---");
      console.log(commentsData.comentarios);
      commentsData.comentarios.forEach(comment => {
        console.log(`Comentario ID: ${comment.id}, Destacado (API):`, comment.destacado, `(Tipo: ${typeof comment.destacado})`);
      });
      console.log("-----------------------------------------------");

      setAllCommentsFromApi(commentsData.comentarios);

      // Obtener todos los usuarios
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
      console.error(
        "❌ Error cargando datos en AppTestimonios (panel admin):",
        err
      );
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsAndUsers();
  }, []); // Se ejecuta una vez al montar el componente

  // Función para iniciar la edición de un comentario
  const handleEditReview = (comment) => {
    // --- LOG 2: Al iniciar edición ---
    console.log(`Iniciando edición para el comentario ID: ${comment.id}`);
    console.log(`Valor original de 'destacado':`, comment.destacado, `(Tipo: ${typeof comment.destacado})`);
    const newEditedDestacado = Number(comment.destacado) === 1 ? 1 : 0;
    console.log(`Valor inicial de editedDestacado (después de Number()): ${newEditedDestacado}`);

    setEditingCommentId(comment.id);
    setEditedContent(comment.contenido);
    setEditedDestacado(newEditedDestacado);
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
    setEditedDestacado(0);
  };

  // Función para guardar los cambios de un comentario
  const handleSaveEditedReview = async (commentId) => {
    setLoading(true);
    setError(null);

    // --- LOG 3: Al guardar edición ---
    console.log(`Guardando comentario ID: ${commentId}`);
    console.log(`Contenido editado: ${editedContent}`);
    console.log(`Estado 'destacado' a enviar a la API: ${editedDestacado}`);

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
            destacado: editedDestacado, // Esto ya es 0 o 1 (número)
          }),
        }
      );
      const data = await response.json();

      // --- LOG 4: Respuesta de la API al guardar ---
      console.log(`Respuesta de la API al guardar comentario ${commentId}:`, data);


      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Error al actualizar el comentario.");
      }

      console.log(`✅ Comentario con ID ${commentId} actualizado exitosamente.`);

      // Actualizar el estado local de allCommentsFromApi
      setAllCommentsFromApi((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, contenido: editedContent, destacado: editedDestacado }
            : comment
        )
      );

      setEditingCommentId(null); // Sale del modo edición
      setEditedContent("");
      setEditedDestacado(0);
    } catch (err) {
      console.error("❌ Error guardando el comentario editado:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un comentario
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

      console.log(`✅ Comentario con ID ${commentId} eliminado exitosamente.`);

      // Actualizar los estados locales eliminando el comentario
      setAllCommentsFromApi((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      console.error("❌ Error eliminando el comentario:", err);
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

      {/* Se eliminó el botón "Publicar Testimonios Seleccionados" ya que la lógica de publicación se eliminó */}

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
            // --- LOG 5: Dentro del map, para cada comentario ---
            const isDestacado = Number(comment.destacado) === 1;
            console.log(`Comentario ID: ${comment.id} - Valor 'destacado' en el map:`, comment.destacado, `(Tipo: ${typeof comment.destacado})`);
            console.log(`Comentario ID: ${comment.id} - Resultado de Number(comment.destacado) === 1: ${isDestacado}`);

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
                  // Usa Number() para asegurar la correcta evaluación
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
                        checked={editedDestacado === 1} // Esto ya es correcto si editedDestacado es 0 o 1 (número)
                        onChange={(e) => setEditedDestacado(e.target.checked ? 1 : 0)}
                        disabled={loading}
                      />
                    }
                    label="Destacado"
                    sx={{ ml: 0, mt: 1 }}
                  />
                )}
                  {editingCommentId !== comment.id && ( // Muestra el estado "destacado" si no está en edición
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