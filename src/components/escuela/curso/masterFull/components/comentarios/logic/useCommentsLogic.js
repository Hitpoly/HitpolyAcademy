import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '.././../../../../../../context/AuthContext'; // Ajusta la ruta si es necesario

export const formatCommentDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString('es-ES', options);
    } catch (e) {
        return dateString;
    }
};

const API_BASE_URL = 'https://apiacademy.hitpoly.com/ajax/';
const COMMENTS_GET_URL = `${API_BASE_URL}getComentariosController.php`;
const COMMENT_POST_URL = `${API_BASE_URL}comentarioController.php`;
const COMMENT_EDIT_URL = `${API_BASE_URL}editarComentariosController.php`;
const COMMENT_DELETE_URL = `${API_BASE_URL}eliminarComentarioController.php`;
const GET_USER_INFO_URL = 'https://apiacademy.hitpoly.com/ajax/traerAlumnoProfesorController.php';

export const useCommentsLogic = (claseId, initialSortOrder = 'recent') => {
    const { user, isAuthenticated } = useAuth(); 
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); 
    const [editingComment, setEditingComment] = useState(null); 
    const [sortOrder, setSortOrder] = useState(initialSortOrder);

    const [usersNamesMap, setUsersNamesMap] = useState(new Map()); 
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchUserName = useCallback(async (userId) => {
        if (!userId) return 'Usuario Desconocido';
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
                setUsersNamesMap(prevMap => {
                    const newMap = new Map(prevMap);
                    newMap.set(userId, fullName);
                    return newMap;
                });
                return fullName;
            } else {
                return 'Usuario Desconocido';
            }
        } catch (err) {
            return 'Error al cargar usuario';
        }
    }, [usersNamesMap]); 
    const organizeComments = useCallback((rawComments, currentSortOrder) => {
        const processedComments = rawComments.map(c => ({
            ...c,
            replies: Array.isArray(c.repllies) ? c.repllies : [],
            fecha_comentario: c.fecha_comentario ? new Date(c.fecha_comentario) : new Date(),
        }));

        const commentsMap = new Map(processedComments.map(c => [c.id, c]));

        const topLevelCommentsMap = new Map();

        processedComments.forEach(c => {
            if (c.respuesta_a_comentario_id === null || c.respuesta_a_comentario_id === "null" || c.respuesta_a_comentario_id === undefined) {
                if (!topLevelCommentsMap.has(c.id)) {
                    topLevelCommentsMap.set(c.id, { ...c, replies: [] }); 
                }
            } else {

                const parentComment = commentsMap.get(c.respuesta_a_comentario_id);
                if (parentComment) {
                    if (!topLevelCommentsMap.has(parentComment.id)) {
                        topLevelCommentsMap.set(parentComment.id, { ...parentComment, replies: [] });
                    }
                    topLevelCommentsMap.get(parentComment.id).replies.push(c);
                } else {
                    if (!topLevelCommentsMap.has(c.id)) {
                        topLevelCommentsMap.set(c.id, { ...c, replies: [] });
                    }
                }
            }
        });
       
        let finalOrganizedComments = Array.from(topLevelCommentsMap.values());

        finalOrganizedComments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => a.fecha_comentario.getTime() - b.fecha_comentario.getTime());
            }
        });

        if (currentSortOrder === 'recent') {
            finalOrganizedComments.sort((a, b) => b.fecha_comentario.getTime() - a.fecha_comentario.getTime());
        } else if (currentSortOrder === 'oldest') {
            finalOrganizedComments.sort((a, b) => a.fecha_comentario.getTime() - b.fecha_comentario.getTime());
        }
        return finalOrganizedComments;
    }, []);


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
                const filteredComments = data.comentarios.filter(comment => String(comment.clase_id) === String(claseId));
                const uniqueUserIds = new Set();
                filteredComments.forEach(comment => {
                    uniqueUserIds.add(comment.usuario_id);
                    if (Array.isArray(comment.repllies)) { 
                        comment.repllies.forEach(reply => uniqueUserIds.add(reply.usuario_id));
                    }
                });
                if (isAuthenticated && user?.id) {
                    uniqueUserIds.add(user.id); 
                }

                const userIdsToFetch = Array.from(uniqueUserIds).filter(id => id && !usersNamesMap.has(id));

                if (userIdsToFetch.length > 0) {
                    setUsersLoading(true);
                    await Promise.all(userIdsToFetch.map(id => fetchUserName(id)));
                    setUsersLoading(false);
                }

                const organizedCommentsResult = organizeComments(filteredComments, sortOrder);
                setComments(organizedCommentsResult);

            } else {
                setComments([]);
            }
        } catch (err) {
            setError('No se pudieron cargar los comentarios. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [claseId, isAuthenticated, user, sortOrder, organizeComments, usersNamesMap, fetchUserName]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]); 
        const handlePostComment = async () => {
        if (!isAuthenticated || !user?.id) {
            setError('Debes iniciar sesión para comentar.');
            return;
        }
        if (!newCommentContent.trim()) return; 
        setLoading(true);
        setError(null);

        const commentData = {
            accion: 'comentarios',
            clase_id: claseId,
            usuario_id: user.id,
            contenido: newCommentContent.trim(),
            fecha_comentario: new Date().toISOString().slice(0, 19).replace('T', ' '),
            respuesta_a_comentario_id: replyingTo,
            es_respuesta_profesor: user.id_tipo_usuario === 2 ? 1 : 0, 
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
                setNewCommentContent('');
                setReplyingTo(null);
                setEditingComment(null);
                fetchComments(); 
            } else {
                throw new Error(data.message || 'Error desconocido al publicar comentario.');
            }
        } catch (err) {
            setError(`Error al publicar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditComment = async () => {
        if (!editingComment || !newCommentContent.trim()) return;

        setLoading(true);
        setError(null);

        const editData = {
            accion: 'update',
            id: editingComment.id,
            contenido: newCommentContent.trim(),
            editado: 1, 
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
                fetchComments(); 
            } else {
                throw new Error(data.message || 'Error desconocido al editar comentario.');
            }
        } catch (err) {
            setError(`Error al editar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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
                fetchComments(); 
            } else {
                throw new Error(data.message || 'Error desconocido al eliminar comentario.');
            }
        } catch (err) {
            setError(`Error al eliminar comentario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyClick = useCallback((commentId) => {
        setReplyingTo(commentId);
        setEditingComment(null); 
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
            setNewCommentContent(`@${userName || 'Usuario cargando...'} `);
        } else {
            setNewCommentContent(`@un comentario `);
        }
    }, [comments, usersNamesMap]); 

    const handleEditButtonClick = (comment) => {
        setEditingComment(comment);
        setNewCommentContent(comment.contenido); 
        setReplyingTo(null); 
    };

    const handleCancelEditOrReply = () => {
        setReplyingTo(null);
        setEditingComment(null);
        setNewCommentContent('');
    };

    const getReplyPlaceholderName = useCallback(() => {
        if (replyingTo) {
            let targetComment = null;
            for (const comment of comments) {
                if (comment.id === replyingTo) {
                    targetComment = comment;
                    break;
                }
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
                return name || 'cargando usuario...'; 
            }
        }
        return 'un comentario';
    }, [replyingTo, comments, usersNamesMap]);

    return {
        comments,
        loading,
        error,
        newCommentContent,
        setNewCommentContent,
        replyingTo,
        editingComment,
        sortOrder,
        setSortOrder, 
        usersNamesMap,
        usersLoading,
        isAuthenticated,
        currentUser: user, 
        handlePostComment,
        handleEditComment,
        handleDeleteComment,
        handleReplyClick,
        handleEditButtonClick,
        handleCancelEditOrReply,
        getReplyPlaceholderName,
    };
};