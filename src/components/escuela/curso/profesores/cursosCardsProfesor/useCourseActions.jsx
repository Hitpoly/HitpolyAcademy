import { useState } from 'react';

const useCourseActions = () => {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingCardCover, setUploadingCardCover] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

    /**
     * Sube imágenes al nuevo sistema de almacenamiento (ImageKit / Almacenamiento Infinito)
     * @param {File} imageFile - El archivo físico
     * @param {Function} setImageUploadingState - Setter para el estado de carga (loading)
     * @param {string} fieldName - Nombre descriptivo para errores
     * @param {number|string} userId - ID del profesor para gestionar su cuota de espacio
     */
    const uploadImageToCloudinary = async (imageFile, setImageUploadingState, fieldName, userId) => {
        if (!imageFile) {
            return { success: false, message: `El archivo ${fieldName} es obligatorio.` };
        }

        setImageUploadingState(true);
        setResponseMessage({ type: 'info', message: `Subiendo imagen para ${fieldName}...` });

        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        formDataImage.append('accion', 'upload');
        formDataImage.append('userId', userId); // Requerido por tu nuevo PHP
        formDataImage.append('type', 'banner'); // Para que se guarde en /perfiles/banners

        try {
            const response = await fetch('https://apiacademy.hitpoly.com/ajax/cloudinary.php', {
                method: 'POST',
                body: formDataImage,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();

            // Tu nuevo PHP devuelve data.success: true
            if (data.success && data.url) {
                setResponseMessage({ type: 'success', message: `${fieldName} subida correctamente.` });
                return { success: true, url: data.url };
            } else {
                return { 
                    success: false, 
                    message: data.message || `Error al procesar la imagen ${fieldName} en ImageKit.` 
                };
            }
        } catch (error) {
            setResponseMessage({ type: 'error', message: `Error al subir ${fieldName}: ${error.message}` });
            return { success: false, message: error.message };
        } finally {
            setImageUploadingState(false);
        }
    };

    const syncFaqsWithBackend = async (courseId, faqsData) => {
        if (!courseId || faqsData.length === 0) {
            return { success: true, message: 'No hay FAQs para sincronizar.' };
        }

        try {
            const response = await fetch('https://apiacademy.hitpoly.com/ajax/cargarPreguntasyRespuestacontroller.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accion: 'sync',
                    course_id: courseId,
                    faqs: faqsData
                }),
            });

            const data = await response.json();
            return data.status === 'success' 
                ? { success: true, message: data.message } 
                : { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: `Error en FAQs: ${error.message}` };
        }
    };

    const submitCourse = async (formData, bannerFile, portadaTarjetaFile, isEditing, preguntasFrecuentes = []) => {
        setLoading(true);
        setResponseMessage({ type: '', message: '' });

        // 1. Validaciones básicas
        if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
            const msg = 'Rellena los campos obligatorios (Título, Descripción, Precio, Categoría).';
            setResponseMessage({ type: 'error', message: msg });
            setLoading(false);
            return { success: false, message: msg };
        }

        const userIdForStorage = formData.profesor_id;

        // 2. Gestión de Imágenes
        let finalBannerUrl = formData.url_banner;
        let finalPortadaTarjetaUrl = formData.portada_targeta;

        // Subir Banner si existe archivo nuevo
        if (bannerFile) {
            const res = await uploadImageToCloudinary(bannerFile, setUploadingBanner, 'banner del curso', userIdForStorage);
            if (!res.success) { setLoading(false); return res; }
            finalBannerUrl = res.url;
        }

        // Subir Portada si existe archivo nuevo
        if (portadaTarjetaFile) {
            const res = await uploadImageToCloudinary(portadaTarjetaFile, setUploadingCardCover, 'portada de tarjeta', userIdForStorage);
            if (!res.success) { setLoading(false); return res; }
            finalPortadaTarjetaUrl = res.url;
        }

        // 3. Preparar datos para el servidor
        const duracionEstimadaCompleta = `${formData.duracion_estimada_valor} ${formData.duracion_estimada_unidad}`;
        const timestamp = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8);

        const dataToSend = {
            ...formData,
            url_banner: finalBannerUrl,
            portada_targeta: finalPortadaTarjetaUrl, 
            duracion_estimada: duracionEstimadaCompleta,
            fecha_actualizacion: timestamp,
            duracion_estimada_valor: undefined,
            duracion_estimada_unidad: undefined,
            marca_plataforma: formData.marca_plataforma || [],
            temario: formData.temario || [],
            preguntas_frecuentes: undefined,
        };
        
        let apiUrl = isEditing 
            ? 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php' 
            : 'https://apiacademy.hitpoly.com/ajax/insertarCursoController.php';

        if (!isEditing) dataToSend.fecha_publicacion = timestamp;

        try {
            setResponseMessage({ type: 'info', message: 'Guardando datos del curso...' });
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                const courseId = isEditing ? formData.id : data.id_curso;

                // 4. Sincronizar FAQs
                const faqsRes = await syncFaqsWithBackend(courseId, preguntasFrecuentes);
                
                setLoading(false);
                return {
                    success: true,
                    message: faqsRes.success ? data.message : `Curso guardado, pero error en FAQs: ${faqsRes.message}`,
                    id: courseId,
                };
            } else {
                setResponseMessage({ type: 'error', message: data.message });
                setLoading(false);
                return { success: false, message: data.message };
            }
        } catch (error) {
            setResponseMessage({ type: 'error', message: `Error de conexión: ${error.message}` });
            setLoading(false);
            return { success: false, message: error.message };
        }
    };

    return {
        loading,
        uploadingBanner,
        uploadingCardCover,
        responseMessage,
        setResponseMessage,
        submitCourse,
    };
};

export default useCourseActions;