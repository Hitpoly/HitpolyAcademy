import React, { useState, useMemo } from 'react';
import {
    Avatar,
    Box,
    Button,
    Collapse,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    IconButton,
    Menu,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCommentsLogic } from './logic/useCommentsLogic'; 

// =====================================================================
// 🚀 FUNCIÓN DE CÁLCULO DE TIEMPO RELATIVO LIMPIA (Asume fecha UTC correcta) 🚀
// =====================================================================
const calculateRelativeTime = (dateInput) => {
    let dateToProcess;
    
    if (dateInput instanceof Date) {
        dateToProcess = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.trim()) {
        let utcDateString = dateInput;
        if (dateInput.includes(' ') && !dateInput.endsWith('Z')) { 
            utcDateString = dateInput.replace(' ', 'T') + 'Z';
        }
        dateToProcess = new Date(utcDateString);
    } else {
        return 'fecha no válida';
    }

    if (isNaN(dateToProcess.getTime())) {
        return 'fecha inválida';
    }

    const now = new Date();
    
    // Calcular la diferencia total en segundos: POSITIVO = Pasado | NEGATIVO = Futuro
    const diffSeconds = Math.floor((now - dateToProcess) / 1000);

    // Si la fecha es futura, se asume un pequeño error de sincronización y se muestra como "justo ahora"
    if (diffSeconds < 0) {
        return 'justo ahora'; 
    }
    
    const seconds = diffSeconds;

    // Si la diferencia absoluta es menor a 60 segundos
    if (seconds < 60) {
        return 'justo ahora';
    }

    let interval;
    
    // Intervalos en segundos (de mayor a menor)
    const intervals = [
        { seconds: 31536000, unit: 'año', plural: 'años' },
        { seconds: 2592000, unit: 'mes', plural: 'meses' },
        { seconds: 604800, unit: 'semana', plural: 'semanas' },
        { seconds: 86400, unit: 'día', plural: 'días' },
        { seconds: 3600, unit: 'hora', plural: 'horas' },
        { seconds: 60, unit: 'minuto', plural: 'minutos' },
    ];

    for (const item of intervals) {
        interval = seconds / item.seconds;
        if (interval >= 1) {
            const value = Math.floor(interval);
            const unit = value === 1 ? item.unit : item.plural;
            
            const prefix = 'hace'; 
            
            return `${prefix} ${value} ${unit}`;
        }
    }
    
    return 'justo ahora'; 
};

// =====================================================================
// 💡 Función auxiliar para mostrar la fecha y hora absoluta del usuario 
// =====================================================================
const formatAbsoluteTime = (dateInput, locale = navigator.language || 'es-PE') => {
    let dateToProcess;
    
    if (dateInput instanceof Date) {
        dateToProcess = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.trim()) {
        let utcDateString = dateInput;
        if (dateInput.includes(' ') && !dateInput.endsWith('Z')) {
            utcDateString = dateInput.replace(' ', 'T') + 'Z';
        }
        dateToProcess = new Date(utcDateString);
    } else {
        return 'Fecha no disponible';
    }

    if (isNaN(dateToProcess.getTime())) {
        return 'Fecha no disponible';
    }

    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    };
    return dateToProcess.toLocaleString(locale, options); 
};


// 💡 CONSTANTES
const INITIAL_COMMENTS_COUNT = 5; 
const COMMENTS_BATCH_SIZE = 10; 
const REPLIES_BATCH_SIZE = 20;

// =====================================================================
// 🆕 COMPONENTE: EditableCommentContent (Para la edición en línea)
// =====================================================================

const EditableCommentContent = ({ 
    comment, 
    level, 
    isEditing, 
    newCommentContent, 
    setNewCommentContent, 
    handleEditComment, 
    handleCancelEditOrReply, 
    getBackgroundColorForLevel,
    isMobile
}) => {
    const isOwner = isEditing && comment.id === isEditing.id;

    if (isOwner) {
        return (
            <Box mt={1} display="flex" flexDirection="column" gap={1} p={1.5} borderRadius={2} sx={{ background: getBackgroundColorForLevel(level) }}>
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Edita tu comentario..."
                    size="small"
                    variant="outlined" 
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        onClick={handleCancelEditOrReply}
                        color="secondary"
                        size="small"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleEditComment}
                        disabled={!newCommentContent.trim()}
                        size="small"
                    >
                        {isMobile ? 'Guardar' : 'Guardar'}
                    </Button>
                </Stack>
            </Box>
        );
    }

    // Esta parte en realidad nunca se alcanzará si la lógica de renderizado principal es correcta
    return (
        <Box sx={{ background: getBackgroundColorForLevel(level), p: 1.5, borderRadius: 2 }}>
            <Typography fontWeight="bold">{comment.commenterName}</Typography>
            <Typography>{comment.contenido}</Typography>
        </Box>
    );
};


// =====================================================================
// 🧩 COMPONENTE PRINCIPAL: CommentSection
// =====================================================================

const CommentSection = ({ claseId }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        comments,
        loading,
        error,
        newCommentContent,
        setNewCommentContent,
        replyingTo,
        editingComment,
        usersNamesMap,
        usersPhotosMap, 
        usersLoading, 
        isAuthenticated,
        currentUser,
        handlePostComment,
        handleEditComment,
        handleDeleteComment,
        handleReplyClick,
        handleEditButtonClick,
        handleCancelEditOrReply,
        setSortOrder, 
    } = useCommentsLogic(claseId); 

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [likedComments, setLikedComments] = useState(new Set());
    const [visibleReplies, setVisibleReplies] = useState({});
    const [expandedReplies, setExpandedReplies] = useState({});
    const [localSortOrder, setLocalSortOrder] = useState('recent'); 
    const [visibleCount, setVisibleCount] = useState(INITIAL_COMMENTS_COUNT); 
    
    // ESTADO CLAVE PARA EL MÓVIL: Controla si la sección de comentarios está abierta
    const [isCommentsOpen, setIsCommentsOpen] = useState(false); 

    const handleMenuClick = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const toggleLike = (id) => {
        setLikedComments((prev) => {
            const updated = new Set(prev);
            updated.has(id) ? updated.delete(id) : updated.add(id);
            return updated;
        });
    };
    
    // FUNCIÓN CLAVE: Toggle para abrir/cerrar la sección de comentarios
    const handleToggleComments = () => {
        setIsCommentsOpen(prev => !prev);
    };

    // Reinicia la paginación al cambiar el orden
    const handleSortOrderChange = (event, newSortOrder) => {
        if (newSortOrder) {
            setLocalSortOrder(newSortOrder);
            setSortOrder(newSortOrder); 
            setVisibleCount(INITIAL_COMMENTS_COUNT);
        }
    };

    const toggleReplies = (commentId) => {
        setVisibleReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
        if (!visibleReplies[commentId]) {
            setExpandedReplies((prev) => ({
                ...prev,
                [commentId]: REPLIES_BATCH_SIZE,
            }));
        }
    };

    const loadMoreReplies = (commentId, totalReplies) => {
        setExpandedReplies((prev) => ({
            ...prev,
            [commentId]: Math.min(prev[commentId] + REPLIES_BATCH_SIZE, totalReplies),
        }));
    };

    const loadMoreComments = () => {
        setVisibleCount(prev => Math.min(prev + COMMENTS_BATCH_SIZE, comments.length));
    };
    
    const hideExtraComments = () => {
        setVisibleCount(INITIAL_COMMENTS_COUNT);
    };
    
    // Comentarios a renderizar (solo los principales)
    const commentsToRender = useMemo(() => {
        return comments.slice(0, visibleCount);
    }, [comments, visibleCount]);

    const getBackgroundColorForLevel = (level) => {
        const colors = [
            '#f0f2f5', 
            '#e8ebef', 
            '#e0e3e7', 
            '#d8dbe0', 
        ];
        return colors[Math.min(level, colors.length - 1)];
    };

    const renderComment = (comment, level = 0) => {
        const commenterName = usersNamesMap.get(comment.usuario_id) || (usersLoading ? '...' : 'Usuario desconocido');
        const commenterPhotoUrl = usersPhotosMap.get(comment.usuario_id); 
        const liked = likedComments.has(comment.id);

        const replies = comment.replies || [];
        const currentVisibleRepliesCount = expandedReplies[comment.id] || 0;
        const isVisible = visibleReplies[comment.id];
        
        const menuCommentId = comment.id;

        const isEditingThisComment = editingComment && editingComment.id === comment.id;
        const isOwner = isAuthenticated && currentUser?.id === comment.usuario_id; 

        const showEditableInput = replyingTo === comment.id;

        return (
            <Box key={comment.id} sx={{ pl: level * 3, mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    {/* AVATAR */}
                    <Avatar src={commenterPhotoUrl}>
                        {commenterName ? commenterName[0] : ''}
                    </Avatar>
                    <Box flex={1}>
                        {/* CONTENIDO DEL COMENTARIO / FORMULARIO DE EDICIÓN */}
                        {isEditingThisComment ? (
                            <EditableCommentContent
                                comment={{ ...comment, commenterName }}
                                level={level}
                                isEditing={editingComment}
                                newCommentContent={newCommentContent}
                                setNewCommentContent={setNewCommentContent}
                                handleEditComment={handleEditComment}
                                handleCancelEditOrReply={handleCancelEditOrReply}
                                getBackgroundColorForLevel={getBackgroundColorForLevel}
                                isMobile={isMobile}
                            />
                        ) : (
                            <Box sx={{ background: getBackgroundColorForLevel(level), p: 1.5, borderRadius: 2 }}>
                                <Typography fontWeight="bold">{commenterName}</Typography>
                                <Typography>{comment.contenido}</Typography>
                            </Box>
                        )}


                        <Stack direction="row" spacing={2} mt={0.5} alignItems="center">
                            {/* ME GUSTA */}
                            <Typography
                                variant="caption"
                                onClick={() => toggleLike(comment.id)}
                                sx={{ cursor: 'pointer', color: liked ? theme.palette.primary.main : 'gray', fontWeight: liked ? 'bold' : 'normal' }}
                            >
                                Me gusta
                            </Typography>
                            {level === 0 && !isEditingThisComment && ( // Permitir responder solo a comentarios principales y cuando no se está editando
                                <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={() => handleReplyClick(comment.id)}>Responder</Typography>
                            )}
                            {/* FECHA: Usa Tooltip para la hora absoluta local */}
                            <Tooltip title={formatAbsoluteTime(comment.fecha_comentario)} placement="top" arrow>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                >
                                    {calculateRelativeTime(comment.fecha_comentario)} {comment.editado === '1' ? '(Editado)' : ''}
                                </Typography>
                            </Tooltip>
                            
                            {/* BOTÓN DE MENÚ */}
                            {(isOwner || currentUser?.id_tipo_usuario === 1) && !isEditingThisComment && ( // Menú de acciones, oculto durante la edición en línea
                                <IconButton size="small" onClick={(e) => handleMenuClick(e, comment)}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        
                        {/* MENÚ DE ACCIONES */}
                        <Menu 
                            anchorEl={anchorEl} 
                            open={Boolean(anchorEl) && selectedComment?.id === menuCommentId} 
                            onClose={handleCloseMenu}
                        >
                            {isOwner && <MenuItem onClick={() => { handleEditButtonClick(comment); handleCloseMenu(); }}>Editar</MenuItem>}
                            {(isOwner || currentUser?.id_tipo_usuario === 1) && <MenuItem onClick={() => { handleDeleteComment(comment.id); handleCloseMenu(); }}>Eliminar</MenuItem>}
                        </Menu>

                        {/* RESPUESTAS ANIDADAS */}
                        {replies.length > 0 && level === 0 && ( // Mostrar respuestas solo para el nivel 0
                            <Box mt={1}>
                                {!isVisible && (
                                    <Button size="small" onClick={() => toggleReplies(comment.id)}>
                                        Ver {replies.length} respuestas
                                    </Button>
                                )}
                                {isVisible && (
                                    <>
                                        <Collapse in={isVisible}>
                                            {/* Aquí se le pasa el nombre del usuario al sub-renderizado */}
                                            {replies.slice(0, currentVisibleRepliesCount).map(r => renderComment({ ...r, commenterName: usersNamesMap.get(r.usuario_id) || 'Usuario desconocido' }, level + 1))} 
                                        </Collapse>
                                        <Box display="flex" justifyContent="flex-end">
                                            {currentVisibleRepliesCount < replies.length ? (
                                                <Button size="small" onClick={() => loadMoreReplies(comment.id, replies.length)}>
                                                    Ver más
                                                </Button>
                                            ) : (
                                                <Button size="small" onClick={() => toggleReplies(comment.id)}>
                                                    Ocultar respuestas
                                                </Button>
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}

                        {/* INPUT DE RESPUESTA EN LÍNEA */}
                        {showEditableInput && !isEditingThisComment && ( // Muestra el input de respuesta si se ha hecho clic en "Responder"
                            <Box mt={1} display="flex" gap={1}>
                                {/* AVATAR DE RESPUESTA */}
                                <Avatar 
                                    src={usersPhotosMap.get(currentUser?.id)} 
                                    sx={{ width: 24, height: 24, flexShrink: 0 }} 
                                >
                                    {currentUser?.nombre ? currentUser.nombre[0] : ''}
                                </Avatar>
                                <Box flexGrow={1} display="flex" flexDirection="column">
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        placeholder={`Responder a @${commenterName}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ mb: 1 }}
                                    />
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button variant="outlined" onClick={handleCancelEditOrReply} color="secondary" size="small">
                                            Cancelar
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            endIcon={<SendIcon />} 
                                            disabled={!newCommentContent.trim()} 
                                            onClick={handlePostComment}
                                            size="small"
                                        >
                                            Enviar
                                        </Button>
                                    </Stack>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Box>
        );
    };

    return (
        <Box>
            <Typography variant="h6" mb={2}>Comentarios</Typography>

            {/* ======================================================= */}
            {/* 1. INPUT DE COMENTARIO PRINCIPAL (MODIFICADO) */}
            {/* ======================================================= */}
            {isAuthenticated && !editingComment && !replyingTo && (
                <Box mt={3} mb={3} display="flex" gap={1} alignItems="flex-end">
                    {/* AVATAR DE PUBLICACIÓN PRINCIPAL */}
                    {/* El mb: 1.5 en el avatar ayuda a alinearlo verticalmente con el inicio del texto del input multilínea */}
                    <Avatar src={usersPhotosMap.get(currentUser?.id)} sx={{ mb: 1.5 }}> 
                        {currentUser?.nombre ? currentUser.nombre[0] : ''}
                    </Avatar>
                    
                    {/* Contenedor del TextField y el Button (alineados en la base) */}
                    <Box flexGrow={1} display="flex" alignItems="flex-end" gap={1}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            placeholder={`Comentar como ${currentUser?.nombre || 'tú'}...`}
                            variant="standard"
                            sx={{
                                flexGrow: 1, 
                                '& .MuiInput-underline:before, & .MuiInput-underline:after': { borderBottomColor: 'divider' },
                            }}
                        />
                        {/* Botón de envío modificado: SOLO ICONO y al costado del input */}
                        <IconButton
                            color="primary"
                            onClick={handlePostComment}
                            disabled={!newCommentContent.trim()}
                            size="medium" 
                            sx={{ 
                                alignSelf: 'flex-end', 
                                mb: 0.5, // Pequeño ajuste para el alineamiento visual
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            )}

            {/* Mensaje de estado de edición/respuesta */}
            {(editingComment || replyingTo) && (
                <Box mt={3} mb={3}>
                    <Typography variant="body2" color="text.secondary">
                        {editingComment ? "Edición en curso..." : replyingTo ? "Respuesta en curso..." : ""}
                        <Button size="small" onClick={handleCancelEditOrReply} sx={{ ml: 1 }}>Cancelar</Button>
                    </Typography>
                </Box>
            )}

            {/* Separador visual */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 2 }} />

            
            {/* ======================================================= */}
            {/* 2. VISTA PREVIA / BOTÓN DE COMENTARIOS COLAPSABLES */}
            {/* ======================================================= */}
            <Box 
                onClick={handleToggleComments} 
                sx={{ cursor: 'pointer', p: 1, my: 2, bgcolor: isCommentsOpen ? 'transparent' : '#f5f5f5', borderRadius: 2 }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                        Comentarios {comments.length.toLocaleString()}
                        {loading && <span style={{ color: theme.palette.text.secondary, fontWeight: 'normal' }}> (Cargando) </span>}
                    </Typography>
                    {/* Ícono para indicar expansión/colapso */}
                    <KeyboardArrowDownIcon 
                        sx={{ 
                            transform: isCommentsOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.3s' 
                        }} 
                    />
                </Stack>

                {/* Muestra el primer comentario cuando está colapsado y si hay comentarios */}
                {!isCommentsOpen && comments.length > 0 && (
                    <Stack direction="row" spacing={1} mt={1} alignItems="center">
                        <Avatar src={usersPhotosMap.get(comments[0].usuario_id)} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ fontWeight: 'bold' }}>{usersNamesMap.get(comments[0].usuario_id) || 'Usuario'}:</span> {comments[0].contenido}
                        </Typography>
                    </Stack>
                )}

                {/* Mensaje si no hay comentarios */}
                {!isCommentsOpen && comments.length === 0 && !loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>¡Aún no hay comentarios! Pincha para agregar. 😊</Typography>
                )}
            </Box>

            {/* ======================================================= */}
            {/* 3. CONTENIDO EXPANDIDO DE COMENTARIOS */}
            {/* ======================================================= */}
            <Collapse in={isCommentsOpen}>
                <Box sx={{ mt: 2 }}>
                    
                    {/* Botones de ordenación (solo visibles si está expandido) */}
                    <Box display="flex" justifyContent="flex-end" mb={2} alignItems="center">
                        <ToggleButtonGroup value={localSortOrder} exclusive onChange={handleSortOrderChange} size="small">
                            <ToggleButton value="recent">Más recientes</ToggleButton>
                            <ToggleButton value="oldest">Más antiguos</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {error && <Typography color="error">{error}</Typography>}
                    
                    {loading ? (
                        <Typography>Cargando comentarios...</Typography>
                    ) : (
                        <>
                            {/* Renderizado de comentarios principales visibles */}
                            {commentsToRender.map(comment => renderComment(comment))} 

                            {/* Botones de paginación para la lista expandida */}
                            {(comments.length > INITIAL_COMMENTS_COUNT) && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    {/* Mostrar Ver menos si hay más que los iniciales */}
                                    {visibleCount > INITIAL_COMMENTS_COUNT && (
                                        <Button onClick={hideExtraComments} variant="text" color="secondary">
                                            Ver menos
                                        </Button>
                                    )}
                                    {/* Mostrar Ver más si la cuenta visible es menor al total */}
                                    {visibleCount < comments.length && (
                                        <Button onClick={loadMoreComments} variant="text" disabled={usersLoading}>
                                            Ver más ({comments.length - visibleCount} restantes)
                                        </Button>
                                    )}
                                </Box>
                            )}
                            
                            {comments.length === 0 && <Typography variant="body2" sx={{ mt: 2 }}>Aún no hay comentarios. ¡Sé el primero en comentar! 😊</Typography>}
                        </>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default CommentSection;