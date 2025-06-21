import { useState } from 'react';

const useCourseActions = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', message: '' });

  // --- Lógica Común para Subir Imágenes (Cloudinary) ---
  const uploadImageToCloudinary = async (bannerFile) => {
    if (!bannerFile) {
      return { success: true, message: 'No se seleccionó archivo de banner, se enviará sin URL.', url: '' };
    }

    setUploadingBanner(true);
    setResponseMessage({ type: 'info', message: 'Subiendo imagen del banner...' });

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
        throw new Error(`Error HTTP al subir imagen: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();

      if (data.url && data.status !== 'error') {
        setResponseMessage({ type: 'success', message: 'Imagen subida correctamente a Cloudinary.' });
        return { success: true, message: data.url };
      } else {
        return { success: false, message: data.message || 'Error al subir la imagen al servidor.' };
      }
    } catch (error) {
      setResponseMessage({ type: 'error', message: `Error de red o interno al subir la imagen: ${error.message}` });
      return { success: false, message: `Error de red o interno al subir la imagen: ${error.message}` };
    } finally {
      setUploadingBanner(false);
    }
  };

  // --- Lógica para el Envío (Inserción/Actualización) del Curso ---
  const submitCourse = async (formData, bannerFile, isEditing) => {
    setLoading(true);
    setResponseMessage({ type: '', message: '' });

    // 1. **Validaciones Previas**
    if (!formData.titulo || !formData.descripcion_corta || !formData.precio || !formData.categoria_id) {
      const errorMessage = 'Por favor, rellena los campos obligatorios del curso (Título, Descripción Corta, Precio, Categoría).';
      setResponseMessage({ type: 'error', message: errorMessage });
      setLoading(false);
      return { success: false, message: errorMessage };
    }

    let finalBannerUrl = formData.url_banner;

    // 2. **Gestión de la Imagen del Banner**
    // Solo subir imagen si se seleccionó un nuevo archivo
    if (bannerFile) {
      const bannerUploadResult = await uploadImageToCloudinary(bannerFile);
      if (!bannerUploadResult.success) {
        setResponseMessage({ type: 'error', message: bannerUploadResult.message });
        setLoading(false);
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
    } else {
      // --- Lógica para ACTUALIZAR Curso ---
      dataToSend.accion = 'update'; // Acción para actualización
      dataToSend.id = formData.id; // Asegurarse de que el ID está presente para la actualización
      apiUrl = 'https://apiacademy.hitpoly.com/ajax/editarCursoController.php';
    }

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
        throw new Error(`Error HTTP al ${isEditing ? 'actualizar' : 'insertar'} curso: ${response.status}, mensaje: ${errorText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setResponseMessage({ type: 'success', message: data.message || `Curso ${isEditing ? 'actualizado' : 'registrado'} correctamente.` });
        setLoading(false);
        return { success: true, message: data.message };
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