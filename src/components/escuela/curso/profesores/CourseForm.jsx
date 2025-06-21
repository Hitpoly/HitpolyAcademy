// CourseForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import CourseDetailsSection from "./CourseDetailsSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseStatusManager from "./cursosCardsProfesor/CourseStatusManager";
import useCourseActions from "./cursosCardsProfesor/useCourseActions";
import { useAuth } from "../../../../context/AuthContext";

const CourseForm = () => {
  const { user } = useAuth();

  const initialFormData = {
    accion: "curso",
    id: null,
    titulo: "",
    subtitulo: "",
    descripcion_corta: "",
    descripcion_larga: "",
    url_banner: "",
    url_video_introductorio: "",
    precio: "",
    moneda: "USD",
    nivel: "",
    duracion_estimada_valor: "",
    duracion_estimada_unidad: "dias",
    estado: "activo",
    profesor_id: user ? user.id : null,
    categoria_id: "",
    fecha_publicacion: new Date().toISOString().slice(0, 10),
    fecha_actualizacion: new Date().toISOString().slice(0, 10),
    horas_por_semana: "",
    fecha_inicio_clases: "",
    fecha_limite_inscripcion: "",
    ritmo_aprendizaje: "",
    tipo_clase: "",
    titulo_credencial: "",
    descripcion_credencial: "",
    marca_plataforma: [],
    temario: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");

  const [newLogoText, setNewLogoText] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTemaTitle, setNewTemaTitle] = useState("");
  const [bannerFile, setBannerFile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [forceRefreshCourseList, setForceRefreshCourseList] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    loading,
    uploadingBanner,
    responseMessage,
    setResponseMessage,
    submitCourse,
  } = useCourseActions();

  const handleForceRefresh = () => {
    setForceRefreshCourseList((prev) => prev + 1);
  };

  useEffect(() => {
    if (responseMessage.message) {
      const timer = setTimeout(() => {
        setResponseMessage({ type: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage, setResponseMessage]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getCategoriasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getcategorias" }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error HTTP al cargar categorías: ${response.status}, mensaje: ${errorText}`
          );
        }

        const data = await response.json();

        if (data.status === "success") {
          setCategorias(data.categorias);
        } else {
          setCategoryErrorMessage(
            data.message || "Error al cargar las categorías desde la API."
          );
        }
      } catch (error) {
        setCategoryErrorMessage(
          "No se pudo conectar con el servidor para obtener las categorías o hubo un error de red."
        );
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (courseToEdit) {
      setIsEditing(true);

      const formatToDateInput = (dateString) => {
        if (!dateString) return "";
        const datePart = dateString.split(" ")[0];
        return datePart;
      };

      const parsedMarcaPlataforma =
        typeof courseToEdit.marcas === "string"
          ? JSON.parse(courseToEdit.marcas)
          : courseToEdit.marcas || [];

      const parsedTemario =
        typeof courseToEdit.curso.temario === "string"
          ? JSON.parse(courseToEdit.curso.temario)
          : courseToEdit.curso.temario || [];

      const newFormData = {
        accion: "update",
        id: courseToEdit.curso.id,
        titulo: courseToEdit.curso.titulo || "",
        subtitulo: courseToEdit.curso.subtitulo || "",
        descripcion_corta: courseToEdit.curso.descripcion_corta || "",
        descripcion_larga: courseToEdit.curso.descripcion_larga || "",
        url_banner: courseToEdit.curso.url_banner || "",
        url_video_introductorio:
          courseToEdit.curso.url_video_introductorio || "",
        precio: courseToEdit.curso.precio
          ? parseFloat(courseToEdit.curso.precio)
          : "",
        moneda: courseToEdit.curso.moneda || "USD",
        nivel: courseToEdit.curso.nivel || "",
        duracion_estimada_valor: courseToEdit.curso.duracion_estimada
          ? String(courseToEdit.curso.duracion_estimada).split(" ")[0]
          : "",
        duracion_estimada_unidad: courseToEdit.curso.duracion_estimada
          ? String(courseToEdit.curso.duracion_estimada).split(" ")[1] || "dias"
          : "dias",
        estado: courseToEdit.curso.estado || "activo",
        profesor_id: courseToEdit.curso.profesor_id || (user ? user.id : null),
        categoria_id: courseToEdit.curso.categoria_id || "",
        fecha_publicacion: formatToDateInput(
          courseToEdit.curso.fecha_publicacion
        ),
        fecha_actualizacion: formatToDateInput(
          new Date().toISOString().slice(0, 10)
        ),
        horas_por_semana: courseToEdit.curso.horas_por_semana || "",
        fecha_inicio_clases: formatToDateInput(
          courseToEdit.curso.fecha_inicio_clases
        ),
        fecha_limite_inscripcion: formatToDateInput(
          courseToEdit.curso.fecha_limite_inscripcion
        ),
        ritmo_aprendizaje: courseToEdit.curso.ritmo_aprendizaje || "",
        tipo_clase: courseToEdit.curso.tipo_clase || "",
        titulo_credencial: courseToEdit.curso.titulo_credencial || "",
        descripcion_credencial: courseToEdit.curso.descripcion_credencial || "",
        marca_plataforma: parsedMarcaPlataforma,
        temario: parsedTemario,
      };
      setFormData(newFormData);
      setBannerFile(null);
    } else {
      setIsEditing(false);
      setFormData({
        ...initialFormData,
        profesor_id: user ? user.id : null,
        fecha_publicacion: new Date().toISOString().slice(0, 10),
        fecha_actualizacion: new Date().toISOString().slice(0, 10),
      });
      setBannerFile(null);
    }
  }, [courseToEdit, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };
      return updatedData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files?.[0] : null;
    setBannerFile(file);
    setResponseMessage({ type: "", message: "" });
    setFormData((prevData) => ({
      ...prevData,
      url_banner: "",
    }));
  };

  const handleAddMarcaPlataforma = () => {
    if (newLogoText && newDescription) {
      const newMarca = { logotext: newLogoText, description: newDescription };
      setFormData((prevData) => {
        const updatedMarcaPlataforma = [...prevData.marca_plataforma, newMarca];
        return {
          ...prevData,
          marca_plataforma: updatedMarcaPlataforma,
        };
      });
      setNewLogoText("");
      setNewDescription("");
      setResponseMessage({ type: "", message: "" });
    } else {
      setResponseMessage({
        type: "error",
        message:
          "Por favor, rellena el texto del logo y la descripción para añadir una marca de plataforma.",
      });
    }
  };

  const handleRemoveMarcaPlataforma = (indexToRemove) => {
    setFormData((prevData) => {
      const updatedMarcaPlataforma = prevData.marca_plataforma.filter(
        (_, index) => index !== indexToRemove
      );
      return {
        ...prevData,
        marca_plataforma: updatedMarcaPlataforma,
      };
    });
  };

  const handleAddTema = () => {
    if (newTemaTitle) {
      const newTema = { titulo: newTemaTitle };
      setFormData((prevData) => {
        const updatedTemario = [...prevData.temario, newTema];
        return {
          ...prevData,
          temario: updatedTemario,
        };
      });
      setNewTemaTitle("");
      setResponseMessage({ type: "", message: "" });
    } else {
      setResponseMessage({
        type: "error",
        message: "Por favor, ingresa un título para el tema.",
      });
    }
  };

  const handleRemoveTema = (indexToRemove) => {
    setFormData((prevData) => {
      const updatedTemario = prevData.temario.filter((_, index) => index !== indexToRemove);
      return {
        ...prevData,
        temario: updatedTemario,
      };
    });
  };

  const handleEditTema = (indexToEdit, newTitle) => {
    setFormData((prevData) => {
      const updatedTemario = prevData.temario.map((tema, index) =>
        index === indexToEdit ? { ...tema, titulo: newTitle } : tema
      );
      return {
        ...prevData,
        temario: updatedTemario,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await submitCourse(formData, bannerFile, isEditing);

    if (result.success) {
      setFormData({
        ...initialFormData,
        profesor_id: user ? user.id : null,
        fecha_publicacion: new Date().toISOString().slice(0, 10),
        fecha_actualizacion: new Date().toISOString().slice(0, 10),
      });
      setBannerFile(null);
      setNewLogoText("");
      setNewDescription("");
      setNewTemaTitle("");
      setIsEditing(false);
      setCourseToEdit(null);
      handleForceRefresh();
    }
  };

  const handleBackToCreateMode = () => {
    setIsEditing(false);
    setCourseToEdit(null);
    setFormData({
      ...initialFormData,
      profesor_id: user ? user.id : null,
      fecha_publicacion: new Date().toISOString().slice(0, 10),
      fecha_actualizacion: new Date().toISOString().slice(0, 10),
    });
    setBannerFile(null);
    setResponseMessage({ type: "", message: "" });
    setNewLogoText("");
    setNewDescription("");
    setNewTemaTitle("");
    handleForceRefresh();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        overflowY: "auto",
        gap: 2,
      }}
    >
      {/* Sección Izquierda: Formulario de Creación/Edición de Cursos */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          width: { xs: "100%", md: "40%" },
          backgroundColor: "white",
          boxShadow: 3,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          {isEditing
            ? `Editar Curso: ${formData.titulo || "Cargando..."}`
            : "Insertar Nuevo Curso"}
        </Typography>

        {isEditing && (
          <Button
            onClick={handleBackToCreateMode}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver a Crear Curso
          </Button>
        )}

        {responseMessage.message && (
          <Alert severity={responseMessage.type} sx={{ mb: 2 }}>
            {responseMessage.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box sx={{ width: "100%", p: 0 }}>
              <CourseDetailsSection
                formData={formData}
                handleChange={handleChange}
                bannerFile={bannerFile}
                handleFileChange={handleFileChange}
                uploadingBanner={uploadingBanner}
                categorias={categorias}
                loadingCategories={loadingCategories}
                categoryErrorMessage={categoryErrorMessage}
                isEditing={isEditing}
              />
            </Box>

            <Box sx={{ width: "100%", p: 0 }}>
              <AdditionalDetailsSection
                formData={formData}
                handleChange={handleChange}
                newLogoText={newLogoText}
                setNewLogoText={setNewLogoText}
                newDescription={newDescription}
                setNewDescription={setNewDescription}
                handleAddMarcaPlataforma={handleAddMarcaPlataforma}
                handleRemoveMarcaPlataforma={handleRemoveMarcaPlataforma}
                newTemaTitle={newTemaTitle}
                setNewTemaTitle={setNewTemaTitle}
                handleAddTema={handleAddTema}
                handleRemoveTema={handleRemoveTema}
                handleEditTema={handleEditTema}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3, py: 1.5, width: "100%" }}
            disabled={loading || uploadingBanner}
          >
            {loading || uploadingBanner ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Curso"
            )}
          </Button>
        </form>
      </Box>

      {/* Sección Derecha: Gestión de Cursos (SOLO lista de cursos) */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          width: { xs: "100%", md: "60%" },
          backgroundColor: "white",
          boxShadow: 3,
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          Gestionar Cursos Existentes
        </Typography>
        <CourseStatusManager
          onEditCourse={(cursoRecibido) => {
            setCourseToEdit(cursoRecibido);
          }}
          refreshTrigger={forceRefreshCourseList}
        />
      </Box>
    </Box>
  );
};

export default CourseForm;