// components/escuela/curso/profesores/useCourseActions.js
import { useState } from 'react';

const useCourseActions = () => {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingCardCover, setUploadingCardCover] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

    const uploadImageToCloudinary = async (imageFile, setImageUploadingState, fieldName) => {
        if (!imageFile) {
            console.log(`LOG: uploadImageToCloudinary - No hay archivo para ${fieldName}.`); // Log 1
            return { success: false, message: `El archivo ${fieldName} es obligatorio.` };
        }

        setImageUploadingState(true);
        setResponseMessage({ type: 'info', message: `Subiendo imagen para ${fieldName}...` });

        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        formDataImage.append('accion', 'upload');

        console.log(`LOG: Subiendo ${fieldName} a Cloudinary:`, imageFile.name); // Log 2

        try {
            const response = await fetch('https://apiacademy.hitpoly.com/ajax/cloudinary.php', {
                method: 'POST',
                body: formDataImage,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`ERROR: HTTP al subir ${fieldName}:`, response.status, errorText); // Log 3
                throw new Error(`Error HTTP al subir ${fieldName}: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();
            console.log(`LOG: Respuesta de Cloudinary para ${fieldName}:`, data); // Log 4

            if (data.url && data.status !== 'error') {
                setResponseMessage({ type: 'success', message: `${fieldName} subida correctamente a Cloudinary.` });
                return { success: true, url: data.url };
            } else {
                return { success: false, message: data.message || `Error al subir la imagen ${fieldName} al servidor.` };
            }
        } catch (error) {
            console.error(`ERROR: Excepción al subir ${fieldName}:`, error); // Log 5
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

        console.log('LOG: Iniciando submitCourse.'); // Log 6
        console.log('LOG: isEditing:', isEditing); // Log 7
        console.log('LOG: bannerFile:', bannerFile); // Log 8
        console.log('LOG: portadaTarjetaFile:', portadaTarjetaFile); // Log 9
        console.log('LOG: formData.url_banner:', formData.url_banner); // Log 10
        
        // ***** CAMBIO CLAVE AQUÍ: Usar formData.portada_targeta para la validación *****
        console.log('LOG: formData.portada_targeta (para validación):', formData.portada_targeta); // Log 11 actualizado

        // 1. **Validaciones Previas**
        if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
            const errorMessage = 'Por favor, rellena los campos obligatorios del curso (Título, Descripción Corta, Precio, Categoría).';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            console.error('ERROR: Campos obligatorios de curso faltantes.'); // Log 12
            return { success: false, message: errorMessage };
        }

        // Validación de archivos de imagen obligatorios (solo si es nuevo o si se ha seleccionado un nuevo archivo)
        if ((!isEditing && !bannerFile) || (isEditing && !bannerFile && !formData.url_banner)) {
            const errorMessage = 'El banner del curso es obligatorio.';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            console.error('ERROR: Banner del curso obligatorio.'); // Log 13
            return { success: false, message: errorMessage };
        }

        // --- LÍNEA CLAVE PARA EL ERROR (ACTUALIZADA con 'g') ---
        // Usamos formData.portada_targeta según tu confirmación.
        if ((!isEditing && !portadaTarjetaFile) || (isEditing && !portadaTarjetaFile && !formData.portada_targeta)) { 
            const errorMessage = 'La portada de tarjeta del curso es obligatoria.';
            setResponseMessage({ type: 'error', message: errorMessage });
            setLoading(false);
            console.error('ERROR: Portada de tarjeta del curso obligatoria.'); // Log 14
            console.log('Detalles de validación de portada de tarjeta:');
            console.log('    - !isEditing:', !isEditing);
            console.log('    - !portadaTarjetaFile:', !portadaTarjetaFile);
            // ***** CAMBIO CLAVE AQUÍ: Usar formData.portada_targeta *****
            console.log('    - isEditing && !portadaTarjetaFile && !formData.portada_targeta:', isEditing && !portadaTarjetaFile && !formData.portada_targeta);
            // ***** CAMBIO CLAVE AQUÍ: Usar formData.portada_targeta *****
            console.log('    - formData.portada_targeta actual:', formData.portada_targeta);
            return { success: false, message: errorMessage };
        }

        let finalBannerUrl = formData.url_banner;
        // ***** CAMBIO CLAVE AQUÍ: Iniciar con formData.portada_targeta *****
        let finalPortadaTarjetaUrl = formData.portada_targeta;

        // 2. **Gestión de la Imagen del Banner**
        if (bannerFile) {
            console.log('LOG: Procesando subida de banner.'); // Log 15
            const bannerUploadResult = await uploadImageToCloudinary(bannerFile, setUploadingBanner, 'banner del curso');
            if (!bannerUploadResult.success) {
                setResponseMessage({ type: 'error', message: bannerUploadResult.message });
                setLoading(false);
                console.error('ERROR: Falló la subida del banner.'); // Log 16
                return { success: false, message: bannerUploadResult.message };
            }
            finalBannerUrl = bannerUploadResult.url;
            console.log('LOG: URL final del banner:', finalBannerUrl); // Log 17
        } else {
            console.log('LOG: No hay nuevo archivo de banner para subir. Usando URL existente:', finalBannerUrl); // Log 18
        }

        // 3. **Gestión de la Imagen de Portada de Tarjeta**
        if (portadaTarjetaFile) {
            console.log('LOG: Procesando subida de portada de tarjeta.'); // Log 19
            const cardCoverUploadResult = await uploadImageToCloudinary(portadaTarjetaFile, setUploadingCardCover, 'portada de tarjeta');
            if (!cardCoverUploadResult.success) {
                setResponseMessage({ type: 'error', message: cardCoverUploadResult.message });
                setLoading(false);
                console.error('ERROR: Falló la subida de portada de tarjeta.'); // Log 20
                return { success: false, message: cardCoverUploadResult.message };
            }
            finalPortadaTarjetaUrl = cardCoverUploadResult.url;
            console.log('LOG: URL final de portada de tarjeta:', finalPortadaTarjetaUrl); // Log 21
        } else {
            console.log('LOG: No hay nuevo archivo de portada de tarjeta para subir. Usando URL existente:', finalPortadaTarjetaUrl); // Log 22
        }

        // 4. **Preparación de Datos Comunes para la API**
        const duracionEstimadaCompleta = `${formData.duracion_estimada_valor} ${formData.duracion_estimada_unidad}`;

        const dataToSend = {
            ...formData,
            url_banner: finalBannerUrl,
            // ***** CAMBIO CLAVE AQUÍ: El campo que envías a la API debe ser 'portada_tarjeta' *****
            // Confirmamos que el campo enviado a la API es 'portada_tarjeta' (con 'j')
            portada_targeta: finalPortadaTarjetaUrl, 
            duracion_estimada: duracionEstimadaCompleta,
            fecha_actualizacion: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8),
            duracion_estimada_valor: undefined,
            duracion_estimada_unidad: undefined,
            marca_plataforma: formData.marca_plataforma || [],
            temario: formData.temario || [],
            preguntas_frecuentes: undefined,
        };
        // Opcional: Eliminar 'url_portada_tarjeta' del objeto final si ya no lo usas en el formData
        // delete dataToSend.url_portada_tarjeta; 
        console.log('LOG: dataToSend final antes de enviar a la API del curso:', dataToSend); // Log 23

        let apiUrl = '';
        let courseId = null;

        // 5. **Lógica Específica de Inserción vs. Edición**
        if (!isEditing) {
            dataToSend.fecha_publicacion = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8);
            dataToSend.accion = 'curso';
            apiUrl = 'https://apiacademy.hitpoly.com/ajax/insertarCursoController.php';
            console.log('LOG: Modo: Creación de curso. API URL:', apiUrl); // Log 24
        } else {
            dataToSend.accion = 'update';
            if (!formData.id) {
                const errorMessage = 'ID del curso es requerido para actualizar.';
                setResponseMessage({ type: 'error', message: errorMessage });
                setLoading(false);
                console.error('ERROR: ID del curso no encontrado en modo edición.'); // Log 25
                return { success: false, message: errorMessage };
            }
            courseId = formData.id;
            apiUrl = 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php';
            console.log('LOG: Modo: Edición de curso. API URL:', apiUrl, 'ID:', courseId); // Log 26
        }

        // 6. **Llamada a la API del Curso Principal**
        try {
            setResponseMessage({ type: 'info', message: isEditing ? 'Actualizando curso...' : 'Registrando curso...' });
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`ERROR: HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso:`, response.status, errorText); // Log 27
                throw new Error(`Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso: ${response.status}, mensaje: ${errorText}`);
            }

            const data = await response.json();
            console.log(`LOG: Respuesta de la API principal del curso (${isEditing ? 'actualizar' : 'insertar'}):`, data); // Log 28

            if (data.status === 'success') {
                if (!isEditing && data.id_curso) {
                    courseId = data.id_curso;
                } else if (isEditing && formData.id) {
                    courseId = formData.id;
                }

                if (!courseId) {
                    console.error("ERROR: No se pudo obtener el ID del curso después de guardar/actualizar."); // Log 29
                    throw new Error("No se pudo obtener el ID del curso después de guardar/actualizar.");
                }

                // 7. **Sincronizar Preguntas Frecuentes**
                console.log('LOG: Sincronizando preguntas frecuentes para el curso ID:', courseId, 'FAQs:', preguntasFrecuentes); // Log 30
                const faqsSyncResult = await syncFaqsWithBackend(courseId, preguntasFrecuentes);
                if (!faqsSyncResult.success) {
                    setResponseMessage({ type: 'warning', message: `Curso guardado, pero hubo un problema al sincronizar FAQs: ${faqsSyncResult.message}` });
                    console.warn('ADVERTENCIA: Falló la sincronización de FAQs:', faqsSyncResult.message); // Log 31
                } else {
                    setResponseMessage({ type: 'success', message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente y FAQs sincronizadas.` });
                    console.log('LOG: FAQs sincronizadas exitosamente.'); // Log 32
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
                console.error(`ERROR: La API del curso reportó un fallo:`, data.message); // Log 33
                return { success: false, message: data.message };
            }
        } catch (error) {
            setResponseMessage({ type: 'error', message: `No se pudo conectar con el servidor al ${isEditing ? 'actualizar' : 'registrar'} el curso: ${error.message}` });
            setLoading(false);
            console.error(`ERROR: Excepción en la llamada a la API del curso:`, error); // Log 34
            return { success: false, message: `Error de red o interno: ${error.message}` };
        } finally {
            setLoading(false);
            console.log('LOG: submitCourse finalizado.'); // Log 35
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