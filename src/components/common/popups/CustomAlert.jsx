import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Zoom,
    IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Zoom ref={ref} {...props} />;
});

const CustomAlert = ({
    open,
    type,
    title,
    message,
    onClose,
    onConfirmAction,
    confirmText,
    cancelText,
    showCancel
}) => {
    // Definición de colores premium basados en la marca #6C4DE2
    const config = {
        success: {
            color: '#00C853',
            icon: <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#00C853' }} />,
            bg: 'rgba(0, 200, 83, 0.05)'
        },
        error: {
            color: '#FF5252',
            icon: <ErrorOutlineIcon sx={{ fontSize: 60, color: '#FF5252' }} />,
            bg: 'rgba(255, 82, 82, 0.05)'
        },
        warning: {
            color: '#FFA000',
            icon: <WarningAmberOutlinedIcon sx={{ fontSize: 60, color: '#FFA000' }} />,
            bg: 'rgba(255, 160, 0, 0.05)'
        },
        info: {
            color: '#6C4DE2', // Tu púrpura de marca
            icon: <InfoOutlinedIcon sx={{ fontSize: 60, color: '#6C4DE2' }} />,
            bg: 'rgba(108, 77, 226, 0.05)'
        },
        confirm: {
            color: '#6C4DE2',
            icon: <WarningAmberOutlinedIcon sx={{ fontSize: 60, color: '#6C4DE2' }} />,
            bg: 'rgba(108, 77, 226, 0.05)'
        }
    };

    const currentConfig = config[type] || config.info;

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
            aria-labelledby="custom-alert-title"
            aria-describedby="custom-alert-description"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    padding: 2,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    minWidth: { xs: '90%', sm: 400 },
                    position: 'relative',
                    overflow: 'visible'
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
                <Box
                    sx={{
                        backgroundColor: currentConfig.bg,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 3
                    }}
                >
                    {currentConfig.icon}
                </Box>
                
                <Typography id="custom-alert-title" variant="h5" fontWeight="700" color="text.primary" gutterBottom>
                    {title}
                </Typography>
                
                <Typography id="custom-alert-description" variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 2 }}>
                {showCancel && (
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: '600',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'text.primary',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                            }
                        }}
                    >
                        {cancelText}
                    </Button>
                )}
                <Button
                    onClick={onConfirmAction}
                    variant="contained"
                    sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: '600',
                        backgroundColor: currentConfig.color,
                        boxShadow: `0 8px 16px ${currentConfig.color}44`,
                        '&:hover': {
                            backgroundColor: currentConfig.color,
                            boxShadow: `0 12px 20px ${currentConfig.color}66`,
                            transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomAlert;
