// components/escuela/curso/profesores/useCourseActions.js
import { useState } from 'react';

const useCourseActions = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

  // --- Lógica Común para Subir Imágenes (Cloudinary) ---
  const uploadImageToCloudinary = async (bannerFile) => {
    if (!bannerFile) {
      console.log("ℹ️ Cloudinary: No se seleccionó archivo de banner.");
      return { success: true, message: 'No se seleccionó archivo de banner, se enviará sin URL.', url: '' };
    }

    setUploadingBanner(true);
    setResponseMessage({ type: 'info', message: 'Subiendo imagen del banner...' });
    console.log("⏳ Cloudinary: Iniciando subida de banner...");

    const formDataImage = new FormData();
    formDataImage.append('file', bannerFile);
    formDataImage.append('accion', 'upload');

    try {
      const response = await fetch('https://apiacademy.hitpoly.com/ajax/cloudinary.php', {
        method: 'POST',
        body: formDataImage,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Cloudinary: Error HTTP al subir imagen:", response.status, errorText);
        throw new Error(`Error HTTP al subir imagen: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Cloudinary: Respuesta de la subida:", data);

      if (data.url && data.status !== 'error') {
        setResponseMessage({ type: 'success', message: 'Imagen subida correctamente a Cloudinary.' });
        return { success: true, message: data.url }; // 'message' contiene la URL si es éxito
      } else {
        console.error("❌ Cloudinary: Error en la respuesta de subida:", data.message || 'Error desconocido.');
        return { success: false, message: data.message || 'Error al subir la imagen al servidor.' };
      }
    } catch (error) {
      console.error("🚨 Cloudinary: Error de red o interno al subir la imagen:", error);
      setResponseMessage({ type: 'error', message: `Error de red o interno al subir la imagen: ${error.message}` });
      return { success: false, message: `Error de red o interno al subir la imagen: ${error.message}` };
    } finally {
      setUploadingBanner(false);
      console.log("🏁 Cloudinary: Finalizada subida de banner.");
    }
  };

  // --- Lógica para el Envío (Inserción/Actualización) del Curso ---
  const submitCourse = async (formData, bannerFile, isEditing) => {
    setLoading(true);
    setResponseMessage({ type: '', message: '' });
    console.log("⏳ CourseActions: Iniciando envío de curso. Modo edición:", isEditing);

    // 1. **Validaciones Previas**
    if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
      const errorMessage = 'Por favor, rellena los campos obligatorios del curso (Título, Descripción Corta, Precio, Categoría).';
      setResponseMessage({ type: 'error', message: errorMessage });
      setLoading(false);
      console.error("❌ CourseActions: Error de validación local:", errorMessage);
      return { success: false, message: errorMessage };
    }

    let finalBannerUrl = formData.url_banner;

    // 2. **Gestión de la Imagen del Banner**
    if (bannerFile) {
      const bannerUploadResult = await uploadImageToCloudinary(bannerFile);
      if (!bannerUploadResult.success) {
        setResponseMessage({ type: 'error', message: bannerUploadResult.message });
        setLoading(false);
        console.error("❌ CourseActions: Fallo al subir el banner.", bannerUploadResult.message);
        return { success: false, message: bannerUploadResult.message };
      }
      finalBannerUrl = bannerUploadResult.message; // 'message' contiene la URL si es éxito
    }

    // 3. **Preparación de Datos Comunes para la API**
    const duracionEstimadaCompleta = `${formData.duracion_estimada_valor} ${formData.duracion_estimada_unidad}`;

    const dataToSend = {
      ...formData,
      url_banner: finalBannerUrl,
      duracion_estimada: duracionEstimadaCompleta,
      fecha_actualizacion: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8),
      duracion_estimada_valor: undefined, // Eliminar del objeto final
      duracion_estimada_unidad: undefined, // Eliminar del objeto final
    };

    // --- ¡CORRECCIÓN CLAVE AQUÍ: ELIMINAR EL JSON.stringify ANTERIOR! ---
    // Asegurarse de que sean arrays antes de enviarlos (ya lo son desde el estado)
    // No necesitamos convertir marca_plataforma y temario a string aquí.
    // El JSON.stringify() final del body se encargará de esto.

    // Si tu temario es un array de strings (como en el ejemplo de Sergio),
    // asegúrate de que tu `formData.temario` también lo sea.
    // Si es un array de objetos como `{ titulo: "..." }`, el backend debe esperarlo así.
    // Asumo que tu `temario` en `formData` ya es un array de strings o array de objetos según tu UI.

    // --- FIN DE LA CORRECCIÓN ---


    let apiUrl = '';

    // 4. **Lógica Específica de Inserción vs. Edición**
    if (!isEditing) {
      // --- Lógica para INSERTAR Curso ---
      dataToSend.fecha_publicacion = new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 8);
      dataToSend.accion = 'curso'; // Acción para inserción
      apiUrl = 'https://apiacademy.hitpoly.com/ajax/insertarCursoController.php';
      console.log("🔄 CourseActions: Modo: INSERTAR curso. URL:", apiUrl);
    } else {
      // --- Lógica para ACTUALIZAR Curso ---
      dataToSend.accion = 'update';
      console.log("DATOS A ENVIDAR PARA EDICION", dataToSend);
      
       apiUrl = 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php';
      console.log("🔄 CourseActions: Modo: ACTUALIZAR curso. URL:", apiUrl);
    }

    // Console logs para depuración justo antes del fetch
    console.log("➡️ CourseActions: Datos finales a enviar (JSON.stringify-ed):", JSON.stringify(dataToSend));
    console.log("➡️ CourseActions: ID del curso en dataToSend:", dataToSend.id);
    console.log("➡️ CourseActions: marca_plataforma en dataToSend (ARRAY de OBJETOS):", dataToSend.marca_plataforma); // Cambiar el label
    console.log("➡️ CourseActions: temario en dataToSend (ARRAY):", dataToSend.temario); // Añadir log para temario

    // 5. **Llamada a la API del Curso**
    try {
      setResponseMessage({ type: 'info', message: isEditing ? 'Actualizando curso...' : 'Registrando curso...' });
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ CourseActions: Error HTTP de la API (respuesta no OK):", response.status, errorText);
        throw new Error(`Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ CourseActions: Respuesta final de la API:", data);

      if (data.status === 'success') {
        setResponseMessage({ type: 'success', message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente.` });
        setLoading(false);
        console.log("🥳 CourseActions: Operación exitosa!");
        return { success: true, message: data.message };
      } else {
        setResponseMessage({ type: 'error', message: data.message || `Error al ${isEditing ? 'actualizar' : 'insertar'} el curso.` });
        setLoading(false);
        console.error("🚫 CourseActions: Error reportado por el servidor:", data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("🚨 CourseActions: Error en el fetch del curso (Excepción):", error);
      setResponseMessage({ type: 'error', message: `No se pudo conectar con el servidor al ${isEditing ? 'actualizar' : 'registrar'} el curso: ${error.message}` });
      setLoading(false);
      return { success: false, message: `Error de red o interno: ${error.message}` };
    } finally {
      setLoading(false);
      console.log("🏁 CourseActions: Finalizado envío de curso.");
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