import React, { useState } from 'react';
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
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useCommentsLogic, formatCommentDate } from './logic/useCommentsLogic';

const REPLIES_BATCH_SIZE = 20;

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
        usersLoading,
        isAuthenticated,
        currentUser,
        handlePostComment,
        handleEditComment,
        handleDeleteComment,
        handleReplyClick,
        handleEditButtonClick,
        handleCancelEditOrReply,
    } = useCommentsLogic(claseId);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [likedComments, setLikedComments] = useState(new Set());
    const [visibleReplies, setVisibleReplies] = useState({});
    const [expandedReplies, setExpandedReplies] = useState({});
    const [sortOrder, setSortOrder] = useState('recent');

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

    const handleSortOrderChange = (event, newSortOrder) => {
        if (newSortOrder) setSortOrder(newSortOrder);
    };

    const toggleReplies = (commentId, totalReplies) => {
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

    const getSortedComments = () => {
        const sorted = [...comments];
        if (sortOrder === 'recent') {
            return sorted.sort((a, b) => new Date(b.fecha_comentario) - new Date(a.fecha_comentario));
        } else if (sortOrder === 'oldest') {
            return sorted.sort((a, b) => new Date(a.fecha_comentario) - new Date(b.fecha_comentario));
        }
        return sorted;
    };

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
        const isOwner = isAuthenticated && currentUser?.id === comment.usuario_id;
        const commenterName = usersNamesMap.get(comment.usuario_id) || 'Usuario desconocido';
        const liked = likedComments.has(comment.id);

        const replies = comment.replies || [];
        const visibleCount = expandedReplies[comment.id] || 0;
        const isVisible = visibleReplies[comment.id];
        const replyPlaceholder = replyingTo === comment.id
            ? `Responder a @${commenterName}`
            : "Escribe tu respuesta...";

        return (
            <Box key={comment.id} sx={{ pl: level * 3, mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    <Avatar />
                    <Box flex={1}>
                        <Box sx={{ background: getBackgroundColorForLevel(level), p: 1.5, borderRadius: 2 }}>
                            <Typography fontWeight="bold">{commenterName}</Typography>
                            <Typography>{comment.contenido}</Typography>
                        </Box>
                        <Stack direction="row" spacing={2} mt={0.5} alignItems="center">
                            <Typography
                                variant="caption"
                                onClick={() => toggleLike(comment.id)}
                                sx={{ cursor: 'pointer', color: liked ? 'blue' : 'gray', display: 'flex', alignItems: 'center' }}
                            >
                                {liked ? <ThumbUpAltIcon fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />} Me gusta
                            </Typography>
                            <Typography variant="caption" sx={{ cursor: 'pointer' }} onClick={() => handleReplyClick(comment.id)}>Responder</Typography>
                            <Typography variant="caption" color="text.secondary">{formatCommentDate(comment.fecha_comentario)} {comment.editado ? '(Editado)' : ''}</Typography>
                            {(isOwner || currentUser?.id_tipo_usuario === 1) && (
                                <IconButton size="small" onClick={(e) => handleMenuClick(e, comment)}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedComment?.id === comment.id} onClose={handleCloseMenu}>
                            {isOwner && <MenuItem onClick={() => { handleEditButtonClick(comment); handleCloseMenu(); }}>Editar</MenuItem>}
                            {(isOwner || currentUser?.id_tipo_usuario === 1) && <MenuItem onClick={() => { handleDeleteComment(comment.id); handleCloseMenu(); }}>Eliminar</MenuItem>}
                        </Menu>

                        {replies.length > 0 && (
                            <Box mt={1}>
                                {!isVisible && (
                                    <Button size="small" onClick={() => toggleReplies(comment.id, replies.length)}>
                                        Ver {Math.min(REPLIES_BATCH_SIZE, replies.length)} de {replies.length} respuestas
                                    </Button>
                                )}
                                {isVisible && (
                                    <>
                                        <Collapse in={isVisible}>
                                            {replies.slice(0, visibleCount).map(r => renderComment(r, level + 1))}
                                        </Collapse>
                                        {visibleCount < replies.length ? (
                                            <Button size="small" onClick={() => loadMoreReplies(comment.id, replies.length)}>
                                                Ver {Math.min(REPLIES_BATCH_SIZE, replies.length - visibleCount)} más de {replies.length}
                                            </Button>
                                        ) : (
                                            <Button size="small" onClick={() => toggleReplies(comment.id, replies.length)}>
                                                Ocultar respuestas
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Box>
                        )}

                        {replyingTo === comment.id && (
                            <Box mt={1} display="flex" gap={1}>
                                <Avatar sx={{ width: 24, height: 24 }} />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    value={newCommentContent}
                                    onChange={(e) => setNewCommentContent(e.target.value)}
                                    placeholder={replyPlaceholder}
                                />
                                <Button variant="contained" endIcon={<SendIcon />} disabled={!newCommentContent.trim()} onClick={handlePostComment}>
                                    
                                </Button>
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

            {isAuthenticated && (
                <Box mt={3} mb={3} display="flex" gap={1}>
                    <Avatar />
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder={editingComment ? "Edita tu comentario..." : "Comentar como tú..."}
                        variant="standard"
                        sx={{
                            '& .MuiInput-underline:before': {
                                borderBottomColor: 'divider',
                            },
                            '& .MuiInput-underline:after': {
                                borderBottomColor: 'primary.main',
                            },
                            '& .MuiInputBase-root': {
                                '& fieldset': {
                                    border: 'none',
                                },
                                '&:hover fieldset': {
                                    border: 'none',
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                },
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={editingComment ? handleEditComment : handlePostComment}
                        disabled={!newCommentContent.trim()}
                    >
                        {editingComment ? "Guardar" : "Enviar"}
                    </Button>
                    {(editingComment || replyingTo) && (
                        <Button
                            variant="outlined"
                            onClick={handleCancelEditOrReply}
                            sx={{ ml: 1 }}
                        >
                            Cancelar
                        </Button>
                    )}
                </Box>
            )}

            <Box display="flex" justifyContent="flex-end" mb={2}>
                <ToggleButtonGroup value={sortOrder} exclusive onChange={handleSortOrderChange}>
                    <ToggleButton value="recent">Más recientes</ToggleButton>
                    <ToggleButton value="oldest">Más antiguos</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && <Typography color="error">{error}</Typography>}
            {loading || usersLoading ? (
                <Typography>Cargando comentarios...</Typography>
            ) : (
                getSortedComments().map(comment => renderComment(comment))
            )}
        </Box>
    );
};

export default CommentSection;