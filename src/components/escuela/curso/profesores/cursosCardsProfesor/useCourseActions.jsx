import { useState } from 'react';

const useCourseActions = () => {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingCardCover, setUploadingCardCover] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

    const uploadImageToCloudinary = async (imageFile, setImageUploadingState, fieldName) => {
        if (!imageFile) {
            return { success: false, message: `El archivo ${fieldName} es obligatorio.` };
        }

        setImageUploadingState(true);
        setResponseMessage({ type: 'info', message: `Subiendo imagen para ${fieldName}...` });

        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        formDataImage.append('accion', 'upload');

        try {
            const response = await fetch('https://apiacademy.hitpoly.com/ajax/cloudinary.php', {
                method: 'POST',
                body: formDataImage,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP al subir ${fieldName}: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();
            if (data.url && data.status !== 'error') {
                setResponseMessage({ type: 'success', message: `${fieldName} subida correctamente a Cloudinary.` });
                return { success: true, url: data.url };
            } else {
                return { success: false, message: data.message || `Error al subir la imagen ${fieldName} al servidor.` };
            }
        } catch (error) {
            setResponseMessage({ type: 'error', message: `Error de red o interno al subir la imagen ${fieldName}: ${error.message}` });
            return { success: false, message: `Error de red o interno al subir la imagen ${fieldName}: ${error.message}` };
        } finally {
            setImageUploadingState(false);
        }
    };

    const syncFaqsWithBackend = async (courseId, faqsData) => {
        if (!courseId || faqsData.length === 0) {
            return { success: true, message: 'No FAQs to sync or no course ID.' };
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP al sincronizar FAQs: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                return { success: true, message: data.message || 'FAQs sincronizadas correctamente.' };
            } else {
                return { success: false, message: data.message || 'Error al sincronizar FAQs.' };
            }
        } catch (error) {
            return { success: false, message: `Error de red o interno al sincronizar FAQs: ${error.message}` };
        }
    };

    const submitCourse = async (formData, bannerFile, portadaTarjetaFile, isEditing, preguntasFrecuentes = []) => {
        setLoading(true);
        setResponseMessage({ type: '', message: '' });

        if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
            const errorMessage = 'Por favor, rellena los campos obligatorios del curso (Título, Descripción Corta, Precio, Categoría).';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            return { success: false, message: errorMessage };
        }

        if ((!isEditing && !bannerFile) || (isEditing && !bannerFile && !formData.url_banner)) {
            const errorMessage = 'El banner del curso es obligatorio.';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            return { success: false, message: errorMessage };
        }
        if ((!isEditing && !portadaTarjetaFile) || (isEditing && !portadaTarjetaFile && !formData.portada_targeta)) { 
            const errorMessage = 'La portada de tarjeta del curso es obligatoria.';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            return { success: false, message: errorMessage };
        }

        let finalBannerUrl = formData.url_banner;
        let finalPortadaTarjetaUrl = formData.portada_targeta;

        if (bannerFile) {
            const bannerUploadResult = await uploadImageToCloudinary(bannerFile, setUploadingBanner, 'banner del curso');
            if (!bannerUploadResult.success) {
                setResponseMessage({ type: 'error', message: bannerUploadResult.message });
                setLoading(false);
                return { success: false, message: bannerUploadResult.message };
            }
            finalBannerUrl = bannerUploadResult.url;
            } else {
            }

        if (portadaTarjetaFile) {
            const cardCoverUploadResult = await uploadImageToCloudinary(portadaTarjetaFile, setUploadingCardCover, 'portada de tarjeta');
            if (!cardCoverUploadResult.success) {
                setResponseMessage({ type: 'error', message: cardCoverUploadResult.message });
                setLoading(false);
                return { success: false, message: cardCoverUploadResult.message };
            }
            finalPortadaTarjetaUrl = cardCoverUploadResult.url;
            } else {
            }

        const duracionEstimadaCompleta = `${formData.duracion_estimada_valor} ${formData.duracion_estimada_unidad}`;

        const dataToSend = {
            ...formData,
            url_banner: finalBannerUrl,
            portada_targeta: finalPortadaTarjetaUrl, 
            duracion_estimada: duracionEstimadaCompleta,
            fecha_actualizacion: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8),
            duracion_estimada_valor: undefined,
            duracion_estimada_unidad: undefined,
            marca_plataforma: formData.marca_plataforma || [],
            temario: formData.temario || [],
            preguntas_frecuentes: undefined,
        };
        
        let apiUrl = '';
        let courseId = null;

        if (!isEditing) {
            dataToSend.fecha_publicacion = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8);
            dataToSend.accion = 'curso';
            apiUrl = 'https://apiacademy.hitpoly.com/ajax/insertarCursoController.php';
            } else {
            dataToSend.accion = 'update';
            if (!formData.id) {
                const errorMessage = 'ID del curso es requerido para actualizar.';
                setResponseMessage({ type: 'error', message: errorMessage });
                setLoading(false);
                return { success: false, message: errorMessage };
            }
            courseId = formData.id;
            apiUrl = 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php';
            }

        try {
            setResponseMessage({ type: 'info', message: isEditing ? 'Actualizando curso...' : 'Registrando curso...' });
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                if (!isEditing && data.id_curso) {
                    courseId = data.id_curso;
                } else if (isEditing && formData.id) {
                    courseId = formData.id;
                }

                if (!courseId) {
                    throw new Error("No se pudo obtener el ID del curso después de guardar/actualizar.");
                }

                const faqsSyncResult = await syncFaqsWithBackend(courseId, preguntasFrecuentes);
                if (!faqsSyncResult.success) {
                    setResponseMessage({ type: 'warning', message: `Curso guardado, pero hubo un problema al sincronizar FAQs: ${faqsSyncResult.message}` });
                    } else {
                    setResponseMessage({ type: 'success', message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente y FAQs sincronizadas.` });
                    }

                setLoading(false);
                return {
                    success: true,
                    message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente.`,
                    id: courseId,
                };
            } else {
                setResponseMessage({ type: 'error', message: data.message || `Error al ${isEditing ? 'actualizar' : 'insertar'} el curso.` });
                setLoading(false);
                return { success: false, message: data.message };
            }
        } catch (error) {
            setResponseMessage({ type: 'error', message: `No se pudo conectar con el servidor al ${isEditing ? 'actualizar' : 'registrar'} el curso: ${error.message}` });
            setLoading(false);
            return { success: false, message: `Error de red o interno: ${error.message}` };
        } finally {
            setLoading(false);
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