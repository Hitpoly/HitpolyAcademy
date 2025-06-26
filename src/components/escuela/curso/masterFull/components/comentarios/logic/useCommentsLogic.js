import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '.././../../../../../../context/AuthContext'; // Ajusta la ruta si es necesario

// Función auxiliar para formatear la fecha
export const formatCommentDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn("Fecha inválida recibida:", dateString);
            return dateString;
        }
        return date.toLocaleDateString('es-ES', options);
    } catch (e) {
        console.error("Error al formatear la fecha:", dateString, e);
        return dateString;
    }
};

// Endpoints (pueden ser constantes globales o definirse aquí si solo se usan en este hook)
const API_BASE_URL = 'https://apiacademy.hitpoly.com/ajax/';
const COMMENTS_GET_URL = `${API_BASE_URL}getComentariosController.php`;
const COMMENT_POST_URL = `${API_BASE_URL}comentarioController.php`;
const COMMENT_EDIT_URL = `${API_BASE_URL}editarComentariosController.php`;
const COMMENT_DELETE_URL = `${API_BASE_URL}eliminarComentarioController.php`;
const GET_USER_INFO_URL = 'https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php';

export const useCommentsLogic = (claseId, initialSortOrder = 'recent') => {
    const { user, isAuthenticated } = useAuth(); // Accede al contexto de autenticación
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // ID del comentario al que se responde
    const [editingComment, setEditingComment] = useState(null); // Objeto de comentario que se está editando
    const [sortOrder, setSortOrder] = useState(initialSortOrder);

    const [usersNamesMap, setUsersNamesMap] = useState(new Map()); // Mapa para cachear nombres de usuario
    const [usersLoading, setUsersLoading] = useState(false); // Estado para la carga de nombres de usuario

    // --- Funciones de Utilidad y Fetching ---

    // Función para obtener el nombre de un usuario por su ID
    const fetchUserName = useCallback(async (userId) => {
        if (!userId) return 'Usuario Desconocido';
        // Si el nombre ya está en el mapa, lo devuelve para evitar peticiones redundantes
        if (usersNamesMap.has(userId)) {
            return usersNamesMap.get(userId);
        }

        try {
            const response = await fetch(GET_USER_INFO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'getAlumnoProfesor', id: userId }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success' && data.usuario) {
                const fullName = `${data.usuario.nombre} ${data.usuario.apellido}`;
                // Actualiza el mapa de nombres de usuario de forma inmutable
                setUsersNamesMap(prevMap => {
                    const newMap = new Map(prevMap);
                    newMap.set(userId, fullName);
                    return newMap;
                });
                return fullName;
            } else {
                console.warn(`No se encontró información para el usuario con ID: ${userId}`, data);
                return 'Usuario Desconocido';
            }
        } catch (err) {
            console.error(`Error al obtener info del usuario ${userId}:`, err);
            return 'Error al cargar usuario';
        }
    }, [usersNamesMap]); // Dependencia: usersNamesMap para asegurar que el caché se usa

    // Función para organizar los comentarios y sus respuestas de forma jerárquica
    const organizeComments = useCallback((rawComments, currentSortOrder) => {
        // Asegura que cada comentario tenga una propiedad 'replies' inicializada
        const processedComments = rawComments.map(c => ({
            ...c,
            // 'repllies' (con doble L) parece ser un error tipográfico en tu backend
            // Aseguramos que siempre sea un array, incluso si viene null/undefined
            replies: Array.isArray(c.repllies) ? c.repllies : [],
            // Convierte la fecha a objeto Date para facilitar la ordenación
            fecha_comentario: c.fecha_comentario ? new Date(c.fecha_comentario) : new Date(),
        }));

        // Crea un mapa para acceder rápidamente a los comentarios por su ID
        const commentsMap = new Map(processedComments.map(c => [c.id, c]));

        // Inicializa un mapa para los comentarios de nivel superior que contendrá las respuestas
        const topLevelCommentsMap = new Map();

        processedComments.forEach(c => {
            // Verifica si es un comentario de nivel superior
            if (c.respuesta_a_comentario_id === null || c.respuesta_a_comentario_id === "null" || c.respuesta_a_comentario_id === undefined) {
                if (!topLevelCommentsMap.has(c.id)) {
                    topLevelCommentsMap.set(c.id, { ...c, replies: [] }); // Asegura que las respuestas estén inicializadas
                }
            } else {
                // Si es una respuesta, busca su comentario padre
                const parentComment = commentsMap.get(c.respuesta_a_comentario_id);
                if (parentComment) {
                    // Si el padre aún no está en el mapa de nivel superior, agrégalo
                    if (!topLevelCommentsMap.has(parentComment.id)) {
                        topLevelCommentsMap.set(parentComment.id, { ...parentComment, replies: [] });
                    }
                    // Agrega la respuesta al padre
                    topLevelCommentsMap.get(parentComment.id).replies.push(c);
                } else {
                    console.warn(`Respuesta con ID ${c.id} no encontró un comentario padre con ID ${c.respuesta_a_comentario_id}. Será tratado como comentario de nivel superior.`);
                    // En caso de que el padre no exista, lo tratamos como comentario de nivel superior.
                    // Esto es un fallback y debería revisarse la integridad de los datos si ocurre.
                    if (!topLevelCommentsMap.has(c.id)) {
                        topLevelCommentsMap.set(c.id, { ...c, replies: [] });
                    }
                }
            }
        });

        // Convierte el mapa de comentarios de nivel superior a un array
        let finalOrganizedComments = Array.from(topLevelCommentsMap.values());

        // Ordena las respuestas dentro de cada comentario padre por fecha
        finalOrganizedComments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => a.fecha_comentario.getTime() - b.fecha_comentario.getTime());
            }
        });

        // Aplica el ordenamiento final a los comentarios de nivel superior
        if (currentSortOrder === 'recent') {
            finalOrganizedComments.sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
        } else if (currentSortOrder === 'oldest') {
            finalOrganizedComments.sort((a, b) => a.fecha_comentario.getTime() - b.fecha_comentario.getTime());
        }
        return finalOrganizedComments;
    }, []);


    // Función principal para obtener todos los comentarios y procesarlos
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(COMMENTS_GET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'getComentarios' }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.comentarios)) {
                // Filtra los comentarios por el claseId actual
                const filteredComments = data.comentarios.filter(comment => String(comment.clase_id) === String(claseId));

                // Identifica IDs de usuario únicos para buscar sus nombres
                const uniqueUserIds = new Set();
                filteredComments.forEach(comment => {
                    uniqueUserIds.add(comment.usuario_id);
                    // Asegúrate de que las respuestas también se consideren para obtener sus user_id
                    if (Array.isArray(comment.repllies)) { // Nota: aquí sigue 'repllies' de tu backend
                        comment.repllies.forEach(reply => uniqueUserIds.add(reply.usuario_id));
                    }
                });
                if (isAuthenticated && user?.id) {
                    uniqueUserIds.add(user.id); // Asegura que el usuario actual también esté en el mapa
                }

                // Filtra los IDs que no están ya en caché para buscar solo los nuevos
                const userIdsToFetch = Array.from(uniqueUserIds).filter(id => id && !usersNamesMap.has(id));

                if (userIdsToFetch.length > 0) {
                    setUsersLoading(true);
                    await Promise.all(userIdsToFetch.map(id => fetchUserName(id)));
                    setUsersLoading(false);
                }

                // Ahora que los nombres de usuario están (o deberían estar) en usersNamesMap, organiza los comentarios
                const organizedCommentsResult = organizeComments(filteredComments, sortOrder);
                setComments(organizedCommentsResult);

            } else {
                console.warn("No se encontraron comentarios o formato de datos inesperado.", data);
                setComments([]);
            }
        } catch (err) {
            console.error('Error al obtener comentarios:', err);
            setError('No se pudieron cargar los comentarios. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [claseId, isAuthenticated, user, sortOrder, organizeComments, usersNamesMap, fetchUserName]);

    // Efecto que se ejecuta al montar el componente y cuando cambian las dependencias
    useEffect(() => {
        fetchComments();
    }, [fetchComments]); // `fetchComments` es una dependencia porque es una función memoizada por useCallback

    // --- Funciones de Acción (CRUD) ---

    // Maneja la publicación de un nuevo comentario o respuesta
    const handlePostComment = async () => {
        if (!isAuthenticated || !user?.id) {
            setError('Debes iniciar sesión para comentar.');
            return;
        }
        if (!newCommentContent.trim()) return; // No permitir comentarios vacíos

        setLoading(true);
        setError(null);

        const commentData = {
            accion: 'comentarios',
            clase_id: claseId,
            usuario_id: user.id,
            contenido: newCommentContent.trim(),
            fecha_comentario: new Date().toISOString().slice(0, 19).replace('T', ' '),
            respuesta_a_comentario_id: replyingTo,
            es_respuesta_profesor: user.id_tipo_usuario === 2 ? 1 : 0, // Si es profesor (tipo 2), marca como respuesta de profesor
            editado: 0,
        };

        try {
            const response = await fetch(COMMENT_POST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al enviar comentario: ${response.status}, mensaje: ${errorText}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                // Limpia el input y los estados de respuesta/edición
                setNewCommentContent('');
                setReplyingTo(null);
                setEditingComment(null);
                fetchComments(); // Recarga los comentarios para mostrar el nuevo
            } else {
                throw new Error(data.message || 'Error desconocido al publicar comentario.');
            }
        } catch (err) {
            console.error('Error al publicar comentario:', err);
            setError(`Error al publicar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Maneja la edición de un comentario existente
    const handleEditComment = async () => {
        if (!editingComment || !newCommentContent.trim()) return;

        setLoading(true);
        setError(null);

        const editData = {
            accion: 'update',
            id: editingComment.id,
            contenido: newCommentContent.trim(),
            editado: 1, // Marca el comentario como editado
        };

        try {
            const response = await fetch(COMMENT_EDIT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al editar comentario: ${response.status}, mensaje: ${errorText}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                setNewCommentContent('');
                setEditingComment(null);
                fetchComments(); // Recarga los comentarios para mostrar la edición
            } else {
                throw new Error(data.message || 'Error desconocido al editar comentario.');
            }
        } catch (err) {
            console.error('Error al editar comentario:', err);
            setError(`Error al editar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Maneja la eliminación de un comentario
    const handleDeleteComment = async (commentId) => {
        if (!isAuthenticated || !user?.id) {
            setError('Debes iniciar sesión para eliminar comentarios.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(COMMENT_DELETE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'delete', id: commentId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al eliminar comentario: ${response.status}, mensaje: ${errorText}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                fetchComments(); // Recarga los comentarios después de la eliminación
            } else {
                throw new Error(data.message || 'Error desconocido al eliminar comentario.');
            }
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            setError(`Error al eliminar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Manejadores de Interfaz de Usuario ---

    // Inicia el modo de respuesta a un comentario
    const handleReplyClick = useCallback((commentId) => {
        setReplyingTo(commentId);
        setEditingComment(null); // Sale del modo edición si estaba activo

        // Busca el comentario objetivo para obtener el nombre de usuario desde el usersNamesMap
        let targetComment = null;
        for (const comment of comments) {
            if (comment.id === commentId) {
                targetComment = comment;
                break;
            }
            if (comment.replies) {
                const reply = comment.replies.find(r => r.id === commentId);
                if (reply) {
                    targetComment = reply;
                    break;
                }
            }
        }

        if (targetComment) {
            const userName = usersNamesMap.get(targetComment.usuario_id);
            // Si el nombre está disponible, lo pre-rellena. De lo contrario, un fallback.
            setNewCommentContent(`@${userName || 'Usuario cargando...'} `);
        } else {
            // Fallback si no se encuentra el comentario (lo cual no debería ocurrir si el ID es válido)
            setNewCommentContent(`@un comentario `);
        }
    }, [comments, usersNamesMap]); // Depende de `comments` y `usersNamesMap`

    // Inicia el modo de edición de un comentario
    const handleEditButtonClick = (comment) => {
        setEditingComment(comment);
        setNewCommentContent(comment.contenido); // Carga el contenido actual del comentario en el input
        setReplyingTo(null); // Sale del modo respuesta si estaba activo
    };

    // Cancela el modo de edición o respuesta
    const handleCancelEditOrReply = () => {
        setReplyingTo(null);
        setEditingComment(null);
        setNewCommentContent(''); // Limpia el input
    };

    // Ya no es estrictamente necesario, ya que handleReplyClick pre-rellena directamente
    // Sin embargo, si lo mantienes para algún otro uso, aquí está la versión actualizada
    const getReplyPlaceholderName = useCallback(() => {
        if (replyingTo) {
            let targetComment = null;
            // Busca el comentario en el array `comments`
            for (const comment of comments) {
                if (comment.id === replyingTo) {
                    targetComment = comment;
                    break;
                }
                // Si el comentario actual tiene respuestas, busca en ellas
                if (comment.replies) {
                    const reply = comment.replies.find(r => r.id === replyingTo);
                    if (reply) {
                        targetComment = reply;
                        break;
                    }
                }
            }
            if (targetComment) {
                const name = usersNamesMap.get(targetComment.usuario_id);
                return name || 'cargando usuario...'; // Muestra "cargando..." si el nombre aún no está disponible
            }
        }
        return 'un comentario'; // Default fallback
    }, [replyingTo, comments, usersNamesMap]); // Depende de estos estados para obtener el nombre

    // Retorna todos los estados y funciones que el componente de frontend necesita
    return {
        comments,
        loading,
        error,
        newCommentContent,
        setNewCommentContent,
        replyingTo,
        editingComment,
        sortOrder,
        setSortOrder, // Permite al frontend cambiar el orden
        usersNamesMap,
        usersLoading,
        isAuthenticated,
        currentUser: user, // Pasa el usuario autenticado para comparaciones de propiedad
        handlePostComment,
        handleEditComment,
        handleDeleteComment,
        handleReplyClick,
        handleEditButtonClick,
        handleCancelEditOrReply,
        getReplyPlaceholderName, // Todavía se exporta por si se usa en el `placeholder` del `TextField`
    };
};