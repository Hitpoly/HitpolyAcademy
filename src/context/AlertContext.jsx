import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '../components/common/popups/CustomAlert';

const AlertContext = createContext();

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlerts debe usarse dentro de un AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        showCancel: false
    });

    const showAlert = useCallback(({ 
        type = 'info', 
        title = '', 
        message = '', 
        onConfirm = null,
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        showCancel = false
    }) => {
        setAlertConfig({
            open: true,
            type,
            title,
            message,
            onConfirm,
            confirmText,
            cancelText,
            showCancel: typeof onConfirm === 'function' || showCancel
        });
    }, []);

    const closeAlert = useCallback(() => {
        setAlertConfig((prev) => ({ ...prev, open: false }));
    }, []);

    const handleConfirm = () => {
        if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
        }
        closeAlert();
    };

    return (
        <AlertContext.Provider value={{ showAlert, closeAlert }}>
            {children}
            <CustomAlert 
                {...alertConfig}
                onClose={closeAlert}
                onConfirmAction={handleConfirm}
            />
        </AlertContext.Provider>
    );
};
