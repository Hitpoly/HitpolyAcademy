import { useState } from 'react';

const useCourseActions = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

  // --- Lógica Común para Subir Imágenes (Cloudinary) ---
  const uploadImageToCloudinary = async (bannerFile) => {
    console.log("[useCourseActions] -> uploadImageToCloudinary: Iniciando proceso de subida de imagen.");
    if (!bannerFile) {
      console.log("[useCourseActions] -> uploadImageToCloudinary: No se seleccionó archivo de banner. Retornando éxito con URL vacía.");
      return { success: true, message: 'No se seleccionó archivo de banner, se enviará sin URL.', url: '' };
    }

    setUploadingBanner(true);
    setResponseMessage({ type: 'info', message: 'Subiendo imagen del banner...' });

    const formDataImage = new FormData();
    formDataImage.append('file', bannerFile);
    formDataImage.append('accion', 'upload');
    console.log("[useCourseActions] -> uploadImageToCloudinary: Preparando formData para Cloudinary.");

    try {
      console.log("[useCourseActions] -> uploadImageToCloudinary: Llamando a la API de Cloudinary...");
      const response = await fetch('https://apiacademy.hitpoly.com/ajax/cloudinary.php', {
        method: 'POST',
        body: formDataImage,
      });
      console.log("[useCourseActions] -> uploadImageToCloudinary: Respuesta RAW de Cloudinary:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[useCourseActions] -> uploadImageToCloudinary: Error HTTP al subir imagen:", response.status, errorText);
        throw new Error(`Error HTTP al subir imagen: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();
      console.log("[useCourseActions] -> uploadImageToCloudinary: Datos JSON de Cloudinary recibidos:", data);

      if (data.url && data.status !== 'error') {
        setResponseMessage({ type: 'success', message: 'Imagen subida correctamente a Cloudinary.' });
        console.log("[useCourseActions] -> uploadImageToCloudinary: Imagen subida exitosamente. URL:", data.url);
        return { success: true, message: data.url };
      } else {
        console.error("[useCourseActions] -> uploadImageToCloudinary: Error lógico en la respuesta de Cloudinary:", data.message || 'Error desconocido.');
        return { success: false, message: data.message || 'Error al subir la imagen al servidor.' };
      }
    } catch (error) {
      setResponseMessage({ type: 'error', message: `Error de red o interno al subir la imagen: ${error.message}` });
      console.error("[useCourseActions] -> uploadImageToCloudinary: Excepción en la subida de imagen:", error);
      return { success: false, message: `Error de red o interno al subir la imagen: ${error.message}` };
    } finally {
      setUploadingBanner(false);
      console.log("[useCourseActions] -> uploadImageToCloudinary: Proceso de subida de imagen finalizado.");
    }
  };

  // --- Lógica para el Envío (Inserción/Actualización) del Curso ---
  const submitCourse = async (formData, bannerFile, isEditing) => {
    console.log(`[useCourseActions] -> submitCourse: Iniciando envío del curso. Modo edición: ${isEditing}`);
    setLoading(true);
    setResponseMessage({ type: '', message: '' });

    // 1. **Validaciones Previas**
    if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
      const errorMessage = 'Por favor, rellena los campos obligatorios del curso (Título, Descripción Corta, Precio, Categoría).';
      setResponseMessage({ type: 'error', message: errorMessage });
      setLoading(false);
      console.warn("[useCourseActions] -> submitCourse: Validación fallida - Campos obligatorios incompletos.");
      return { success: false, message: errorMessage };
    }

    let finalBannerUrl = formData.url_banner;

    // 2. **Gestión de la Imagen del Banner**
    // Solo subir imagen si se seleccionó un nuevo archivo
    if (bannerFile) {
      console.log("[useCourseActions] -> submitCourse: Archivo de banner detectado. Intentando subir a Cloudinary...");
      const bannerUploadResult = await uploadImageToCloudinary(bannerFile);
      if (!bannerUploadResult.success) {
        setResponseMessage({ type: 'error', message: bannerUploadResult.message });
        setLoading(false);
        console.error("[useCourseActions] -> submitCourse: Falló la subida del banner.");
        return { success: false, message: bannerUploadResult.message };
      }
      finalBannerUrl = bannerUploadResult.message; // 'message' contiene la URL si es éxito
      console.log("[useCourseActions] -> submitCourse: Banner subido. URL final:", finalBannerUrl);
    } else {
      console.log("[useCourseActions] -> submitCourse: No se seleccionó nuevo banner. Usando URL existente:", finalBannerUrl);
    }

    // 3. **Preparación de Datos Comunes para la API**
    const duracionEstimadaCompleta = `${formData.duracion_estimada_valor} ${formData.duracion_estimada_unidad}`;
    console.log("[useCourseActions] -> submitCourse: Duración estimada completa:", duracionEstimadaCompleta);

    const dataToSend = {
      ...formData,
      url_banner: finalBannerUrl,
      duracion_estimada: duracionEstimadaCompleta,
      fecha_actualizacion: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8),
      duracion_estimada_valor: undefined, // Eliminar del objeto final
      duracion_estimada_unidad: undefined, // Eliminar del objeto final
    };

    // Ya no hacer stringify manualmente sobre marca_plataforma
if (!Array.isArray(dataToSend.marca_plataforma)) {
  // Si no es un array, aseguramos que sea un array vacío
  dataToSend.marca_plataforma = [];
}

    let apiUrl = '';

    // 4. **Lógica Específica de Inserción vs. Edición**
    if (!isEditing) {
      // --- Lógica para INSERTAR Curso ---
      dataToSend.fecha_publicacion = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8);
      dataToSend.accion = 'curso'; // Acción para inserción
      apiUrl = 'https://apiacademy.hitpoly.com/ajax/insertarCursoController.php';
      console.log("[useCourseActions] -> submitCourse: Configurado para INSERTAR curso. Acción:", dataToSend.accion);
    } else {
      // --- Lógica para ACTUALIZAR Curso ---
      dataToSend.accion = 'update'; // Acción para actualización
      dataToSend.id = formData.id; // Asegurarse de que el ID está presente para la actualización
      apiUrl = 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php';
      console.log("[useCourseActions] -> submitCourse: Configurado para ACTUALIZAR curso. Acción:", dataToSend.accion, "ID:", dataToSend.id);
    }

    console.log("[useCourseActions] -> submitCourse: URL de la API final:", apiUrl);
    console.log("[useCourseActions] -> submitCourse: Datos FINALES a enviar a la API:", dataToSend);

    // 5. **Llamada a la API del Curso**
    try {
      setResponseMessage({ type: 'info', message: isEditing ? 'Actualizando curso...' : 'Registrando curso...' });
      console.log(`[useCourseActions] -> submitCourse: Llamando a la API del curso (${isEditing ? 'actualizar' : 'insertar'})...`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      console.log("[useCourseActions] -> submitCourse: Respuesta RAW de la API del curso:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[useCourseActions] -> submitCourse: Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso:`, response.status, errorText);
        throw new Error(`Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();
      console.log("[useCourseActions] -> submitCourse: Datos JSON de la API del curso recibidos:", data);

      if (data.status === 'success') {
        setResponseMessage({ type: 'success', message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente.` });
        setLoading(false);
        console.log(`[useCourseActions] -> submitCourse: Curso ${isEditing ? 'actualizado' : 'registrado'} exitosamente.`);
        return { success: true, message: data.message };
      } else {
        setResponseMessage({ type: 'error', message: data.message || `Error al ${isEditing ? 'actualizar' : 'insertar'} el curso.` });
        setLoading(false);
        console.error(`[useCourseActions] -> submitCourse: Error lógico en la respuesta de la API del curso:`, data.message || `Status: ${data.status}`);
        return { success: false, message: data.message };
      }
    } catch (error) {
      setResponseMessage({ type: 'error', message: `No se pudo conectar con el servidor al ${isEditing ? 'actualizar' : 'registrar'} el curso: ${error.message}` });
      setLoading(false);
      console.error("[useCourseActions] -> submitCourse: Excepción global al enviar curso:", error);
      return { success: false, message: `Error de red o interno: ${error.message}` };
    } finally {
      console.log("[useCourseActions] -> submitCourse: Proceso de envío del curso finalizado.");
    }
  };

  return {
    loading,
    uploadingBanner,
    responseMessage,
    setResponseMessage,
    submitCourse,
  };
};

export default useCourseActions;