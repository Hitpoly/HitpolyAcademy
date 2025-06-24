// components/escuela/curso/profesores/useCourseFormLogic.js
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";
import useCourseActions from "../cursosCardsProfesor/useCourseActions";
import { useTheme, useMediaQuery } from "@mui/material";
import Swal from 'sweetalert2';

const useCourseFormLogic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const courseToEdit = location.state?.courseToEdit || null;

  const initialFormData = {
    accion: "curso", // O "insert" para crear
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

  const {
    loading,
    uploadingBanner,
    responseMessage,
    setResponseMessage,
    submitCourse,
  } = useCourseActions();

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
      setResponseMessage({ type: "", message: "" });

      const formatToDateInput = (dateString) => {
        if (!dateString) return "";
        const datePart = dateString.split(" ")[0];
        return datePart;
      };

      let parsedMarcaPlataforma = [];
      try {
        if (typeof courseToEdit.marcas === "string") {
          
          parsedMarcaPlataforma = JSON.parse(courseToEdit.marcas);
        } else if (Array.isArray(courseToEdit.marcas)) {
          
          parsedMarcaPlataforma = courseToEdit.marcas;
        }
      } catch (e) {
        console.error("🐛 Error al parsear marcas de plataforma:", e);
        parsedMarcaPlataforma = [];
      }

      let parsedTemario = [];
      try {
        if (typeof courseToEdit.curso.temario === "string") {
          parsedTemario = JSON.parse(courseToEdit.curso.temario);
        } else if (Array.isArray(courseToEdit.curso.temario)) {
          parsedTemario = courseToEdit.curso.temario;
        }
      } catch (e) {
        console.error("🐛 Error al parsear temario:", e);
        parsedTemario = [];
      }

      const newFormData = {
        accion: "update", // <-- ¡Asegúrate de que la acción sea 'update' al editar!
        id: courseToEdit.curso.id, // <-- ¡VERIFICA QUE EL ID SE CARGUE AQUÍ!
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
        descripcion_credencial:
          courseToEdit.curso.descripcion_credencial || "",
        marca_plataforma: parsedMarcaPlataforma,
        temario: parsedTemario,
      };
      setFormData(newFormData);
      setBannerFile(null);
      console.log("🐛 CourseFormLogic: Curso cargado para edición:", newFormData);
      console.log("🐛 CourseFormLogic: ID del curso cargado:", newFormData.id);
      console.log("🐛 CourseFormLogic: Marcas de plataforma cargadas:", newFormData.marca_plataforma);
    } else {
      setIsEditing(false);
      setResponseMessage({ type: "", message: "" });
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
      console.log("🐛 CourseFormLogic: Formulario inicializado para nuevo curso.");
    }
  }, [location.state, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file =
      e.target.files && e.target.files.length > 0 ? e.target.files?.[0] : null;
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
        const updatedMarcas = [...prevData.marca_plataforma, newMarca];
        console.log("🐛 CourseFormLogic: Marcas después de añadir:", updatedMarcas);
        return {
          ...prevData,
          marca_plataforma: updatedMarcas,
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

  
 const handleRemoveMarcaPlataforma = async (idToRemove) => {
  if (!idToRemove) {
    console.warn("⚠️ No se encontró ID para la marca, no se puede eliminar del backend.");
    return;
  }

  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción eliminará la marca permanentemente.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch("https://apiacademy.hitpoly.com/ajax/eliminarMarcaPlataformaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "delete",
          id: idToRemove,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        Swal.fire('Eliminado!', 'La marca ha sido eliminada.', 'success');
      
        setFormData((prevData) => ({
          ...prevData,
          marca_plataforma: prevData.marca_plataforma.filter(
            (marca) => marca.id !== idToRemove
          ),
        }));
      } else {
        Swal.fire('Error', `No se pudo eliminar: ${data.message}`, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de red al eliminar la marca.', 'error');
    }
  }
};



  const handleEditMarcaPlataforma = useCallback(
    (indexToEdit, updatedLogoText, updatedDescription) => {
      setFormData((prevData) => {
        const updatedMarcas = prevData.marca_plataforma.map((marca, index) =>
          index === indexToEdit
            ? { ...marca, logotext: updatedLogoText, description: updatedDescription }
            : marca
        );
        console.log("🐛 CourseFormLogic: Marcas después de editar:", updatedMarcas);
        return { ...prevData, marca_plataforma: updatedMarcas };
      });
    },
    []
  );

  const handleAddTema = () => {
    if (newTemaTitle) {
      const newTema = { titulo: newTemaTitle };
      setFormData((prevData) => ({
        ...prevData,
        temario: [...prevData.temario, newTema],
      }));
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
    setFormData((prevData) => ({
      ...prevData,
      temario: prevData.temario.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleEditTema = (indexToEdit, newTitle) => {
    setFormData((prevData) => ({
      ...prevData,
      temario: prevData.temario.map((tema, index) =>
        index === indexToEdit ? { ...tema, titulo: newTitle } : tema
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🐛 CourseFormLogic: FormData FINAL antes de llamar a submitCourse:", formData);
    console.log("🐛 CourseFormLogic: ID del curso a enviar desde FormData FINAL:", formData.id); // Nuevo console.log
    const result = await submitCourse(formData, bannerFile, isEditing);
    if (result.success) {
      navigate("/mis-cursos", { state: { shouldRefresh: true } });
    }
  };

  const handleNavigateToMyCourses = () => {
    navigate("/mis-cursos");
  };

  return {
    formData,
    setFormData,
    categorias,
    loadingCategories,
    categoryErrorMessage,
    newLogoText,
    setNewLogoText,
    newDescription,
    setNewDescription,
    newTemaTitle,
    setNewTemaTitle,
    bannerFile,
    setBannerFile,
    isEditing,
    loading,
    uploadingBanner,
    responseMessage,
    setResponseMessage,
    handleChange,
    handleFileChange,
    handleAddMarcaPlataforma,
    handleRemoveMarcaPlataforma,
    handleEditMarcaPlataforma,
    handleAddTema,
    handleRemoveTema,
    handleEditTema,
    handleSubmit,
    handleNavigateToMyCourses,
    isMobile,
  };
};

export default useCourseFormLogic;