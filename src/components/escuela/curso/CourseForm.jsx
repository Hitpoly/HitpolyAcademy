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

import CourseDetailsSection from "./components/CourseDetailsSection";
import AdditionalDetailsSection from "./components/AdditionalDetailsSection";
import CourseStatusManager from "./components/cursos/CourseStatusManager";
import useCourseActions from "./components/cursos/useCourseActions";
import { useAuth } from "../../../context/AuthContext";

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
    marca_plataforma: [], // Asegurarse de que sea un array vacío al inicio
  };

  const [formData, setFormData] = useState(initialFormData);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");

  const [newLogoText, setNewLogoText] = useState("");
  const [newDescription, setNewDescription] = useState("");
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
    console.log("[CourseForm] -> useEffect courseToEdit: courseToEdit ha cambiado:", courseToEdit);
    if (courseToEdit) {
      setIsEditing(true);

      const formatToDateInput = (dateString) => {
        if (!dateString) return "";
        const datePart = dateString.split(" ")[0];
        return datePart;
      };

      const parsedMarcaPlataforma =
        typeof courseToEdit.marca_plataforma === "string"
          ? JSON.parse(courseToEdit.marca_plataforma)
          : courseToEdit.marca_plataforma || [];

      console.log("[CourseForm] -> useEffect courseToEdit: raw marca_plataforma from courseToEdit:", courseToEdit.marca_plataforma);
      console.log("[CourseForm] -> useEffect courseToEdit: parsed marca_plataforma:", parsedMarcaPlataforma);

      const newFormData = {
        accion: "update",
        id: courseToEdit.id,
        titulo: courseToEdit.titulo || "",
        subtitulo: courseToEdit.subtitulo || "",
        descripcion_corta: courseToEdit.descripcion_corta || "",
        descripcion_larga: courseToEdit.descripcion_larga || "",
        url_banner: courseToEdit.url_banner || "",
        url_video_introductorio: courseToEdit.url_video_introductorio || "",
        precio: courseToEdit.precio ? parseFloat(courseToEdit.precio) : "",
        moneda: courseToEdit.moneda || "USD",
        nivel: courseToEdit.nivel || "",
        duracion_estimada_valor: courseToEdit.duracion_estimada
          ? String(courseToEdit.duracion_estimada).split(" ")[0]
          : "",
        duracion_estimada_unidad: courseToEdit.duracion_estimada
          ? String(courseToEdit.duracion_estimada).split(" ")[1] || "dias"
          : "dias",
        estado: courseToEdit.estado || "activo",
        profesor_id: courseToEdit.profesor_id || (user ? user.id : null),
        categoria_id: courseToEdit.categoria_id || "",
        fecha_publicacion: formatToDateInput(courseToEdit.fecha_publicacion),
        fecha_actualizacion: formatToDateInput(
          new Date().toISOString().slice(0, 10)
        ),
        horas_por_semana: courseToEdit.horas_por_semana || "",
        fecha_inicio_clases: formatToDateInput(
          courseToEdit.fecha_inicio_clases
        ),
        fecha_limite_inscripcion: formatToDateInput(
          courseToEdit.fecha_limite_inscripcion
        ),
        ritmo_aprendizaje: courseToEdit.ritmo_aprendizaje || "",
        tipo_clase: courseToEdit.tipo_clase || "",
        titulo_credencial: courseToEdit.titulo_credencial || "",
        descripcion_credencial: courseToEdit.descripcion_credencial || "",
        marca_plataforma: parsedMarcaPlataforma, // Usar la versión parseada
      };
      setFormData(newFormData);
      setBannerFile(null);
      console.log("[CourseForm] -> useEffect courseToEdit: newFormData aplicado:", newFormData);
    } else {
      setIsEditing(false);
      setFormData({
        ...initialFormData,
        profesor_id: user ? user.id : null,
        fecha_publicacion: new Date().toISOString().slice(0, 10),
        fecha_actualizacion: new Date().toISOString().slice(0, 10),
      });
      setBannerFile(null);
      console.log("[CourseForm] -> useEffect courseToEdit: Restableciendo a modo creación. formData:", formData);
    }
  }, [courseToEdit, user]); // Añade 'formData' aquí para evitar errores de lint si lo usas en el else, aunque ya está cubierto por el initialFormData

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log(`[CourseForm] -> handleChange: ${name}: ${value}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file);
    setResponseMessage({ type: "", message: "" });
    setFormData((prevData) => ({
      ...prevData,
      url_banner: "", // Borrar URL existente al subir nuevo archivo
    }));
    console.log("[CourseForm] -> handleFileChange: Archivo de banner seleccionado:", file);
  };

  const handleAddMarcaPlataforma = () => {
    console.log("[CourseForm] -> handleAddMarcaPlataforma: newLogoText:", newLogoText, "newDescription:", newDescription);
    console.log("[CourseForm] -> handleAddMarcaPlataforma: Current formData.marca_plataforma BEFORE add:", formData.marca_plataforma);

    if (newLogoText && newDescription) {
      const newMarca = { logotext: newLogoText, description: newDescription };
      setFormData((prevData) => {
        const updatedMarcas = [...prevData.marca_plataforma, newMarca];
        console.log("[CourseForm] -> handleAddMarcaPlataforma: Updated formData.marca_plataforma AFTER add:", updatedMarcas);
        return {
          ...prevData,
          marca_plataforma: updatedMarcas,
        };
      });
      setNewLogoText("");
      setNewDescription("");
    } else {
      setResponseMessage({
        type: "error",
        message:
          "Por favor, rellena el texto del logo y la descripción para añadir una marca de plataforma.",
      });
    }
  };

  const handleRemoveMarcaPlataforma = (indexToRemove) => {
    console.log("[CourseForm] -> handleRemoveMarcaPlataforma: Index to remove:", indexToRemove);
    setFormData((prevData) => {
      const filteredMarcas = prevData.marca_plataforma.filter(
        (_, index) => index !== indexToRemove
      );
      console.log("[CourseForm] -> handleRemoveMarcaPlataforma: Updated formData.marca_plataforma AFTER remove:", filteredMarcas);
      return {
        ...prevData,
        marca_plataforma: filteredMarcas,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      profesor_id: isEditing ? formData.profesor_id : user ? user.id : null,
    };

    console.log("[CourseForm] -> handleSubmit: Final formData.marca_plataforma before sending to useCourseActions:", dataToSend.marca_plataforma);

    const result = await submitCourse(dataToSend, bannerFile, isEditing);

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
      setIsEditing(false);
      setCourseToEdit(null);
      handleForceRefresh();
      console.log("[CourseForm] -> handleSubmit: Formulario reiniciado.");
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
    handleForceRefresh();
    console.log("[CourseForm] -> handleBackToCreateMode: Volviendo a modo creación.");
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