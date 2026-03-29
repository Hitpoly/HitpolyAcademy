import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '.././../../../../../../context/AuthContext';
import { useAlerts } from '.././../../../../../../context/AlertContext';

const API_BASE_URL = 'https://apiacademy.hitpoly.com/ajax/';
const COMMENTS_GET_URL = `${API_BASE_URL}getComentariosController.php`;
const COMMENT_POST_URL = `${API_BASE_URL}comentarioController.php`;
const COMMENT_ACTION_URL = `${API_BASE_URL}getComentariosController.php`; // Unificado
const GET_USER_INFO_URL = 'https://apiweb.hitpoly.com/ajax/usuarioMasterController.php';

export const useCommentsLogic = (claseId, initialSortOrder = 'recent') => {
    const { user, isAuthenticated } = useAuth(); 
    const { showAlert } = useAlerts();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); 
    const [editingComment, setEditingComment] = useState(null); 
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    
    // Estados para paginación
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    // Ya no necesitamos fetchUserName porque los datos vienen del JOIN en SQL.

    const organizeComments = useCallback((rawComments, currentSortOrder) => {
        const processedComments = rawComments.map(c => ({
            ...c,
            fecha_comentario: new Date(c.fecha_comentario), 
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

    const fetchComments = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setOffset(0);
        }
        setError(null);

        try {
            const currentOffset = isLoadMore ? offset : 0;
            const payload = { 
                accion: 'getComentarios',
                clase_id: claseId,
                limit: LIMIT,
                offset: currentOffset
            };

            console.log('[CommentsLogic] Fetching from:', COMMENTS_GET_URL);
            console.log('[CommentsLogic] Payload sent:', payload);

            const response = await fetch(COMMENTS_GET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            console.log('[CommentsLogic] Full response data:', data);

            if (data.status === 'success' && Array.isArray(data.comentarios)) {
                const newComments = data.comentarios;
                
                if (newComments.length < LIMIT) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                setComments(prev => {
                    const combinedRaw = isLoadMore ? [...prev.flatMap(c => [c, ...(c.replies||[])]), ...newComments] : newComments;
                    return organizeComments(combinedRaw, sortOrder);
                });
                
                if (isLoadMore) {
                    setOffset(prev => prev + LIMIT);
                } else {
                    setOffset(LIMIT);
                }
            } else {
                if (!isLoadMore) setComments([]);
                setHasMore(false);
            }
        } catch (err) {
            setError('No se pudieron cargar los comentarios. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [claseId, sortOrder, organizeComments, offset]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchComments(true);
        }
    };

    useEffect(() => {
        fetchComments(false);
    }, [claseId, sortOrder]);

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
            respuesta_a_comentario_id: replyingTo,
            es_respuesta_profesor: user.id_tipo_usuario === 2 ? 1 : 0, 
            editado: 0,
            destacado: 0,
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
            usuario_id: user.id, // Enviar ID para verificar dueño
            contenido: newCommentContent.trim(),
        };

        try {
            const response = await fetch(COMMENT_ACTION_URL, {
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
                fetchComments(false); // Recargar
                showAlert({
                    type: 'success',
                    title: '¡Publicado!',
                    message: 'Tu comentario se ha compartido correctamente.'
                });
            } else {
                throw new Error(data.message || 'Error al publicar comentario');
            }
        } catch (err) {
            setError(`Error al editar comentario: ${err.message}`);
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo editar el comentario.' });
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
            const response = await fetch(COMMENT_ACTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    accion: 'delete', 
                    id: commentId,
                    usuario_id: user.id // Enviar ID para verificar dueño
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al eliminar comentario: ${response.status}, mensaje: ${errorText}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                fetchComments(false);
                showAlert({
                    type: 'success',
                    title: 'Eliminado',
                    message: 'El comentario ha sido borrado correctamente.'
                });
            } else {
                throw new Error(data.message || 'Error al eliminar');
            }
        } catch (err) {
            setError(`Error al eliminar comentario: ${err.message}`);
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar el comentario.' });
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
            const userName = targetComment.nombre || 'Usuario';
            setNewCommentContent(`@${userName} `);
        } else {
            setNewCommentContent(`@un comentario `);
        }
    }, [comments]); 

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
        isAuthenticated,
        currentUser: user, 
        handlePostComment,
        handleEditComment,
        handleDeleteComment,
        handleReplyClick,
        handleEditButtonClick,
        handleCancelEditOrReply,
        loadMore,
        hasMore,
    };
};