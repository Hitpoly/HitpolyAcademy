// components/escuela/curso/profesores/useCourseFormLogic.js
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";
import useCourseActions from "../cursosCardsProfesor/useCourseActions";
import { useTheme, useMediaQuery } from "@mui/material";
import Swal from "sweetalert2";

const useCourseFormLogic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const courseToEdit = location.state?.courseToEdit || null;

  const [preguntasFrecuentes, setPreguntasFrecuentes] = useState([]);
  const [newPregunta, setNewPregunta] = useState("");
  const [newRespuesta, setNewRespuesta] = useState("");

  const initialFormData = {
    accion: "curso",
    id: null,
    titulo: "",
    subtitulo: "",
    descripcion_corta: "",
    descripcion_larga: "",
    url_banner: "",
    portada_targeta: "",
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
    preguntas_frecuentes: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");

  const [newLogoText, setNewLogoText] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTemaTitle, setNewTemaTitle] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [cardCoverFile, setCardCoverFile] = useState(null); 

  const [isEditing, setIsEditing] = useState(false);

  const {
    loading,
    uploadingBanner,
    uploadingCardCover,
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

        parsedMarcaPlataforma = parsedMarcaPlataforma.map((marca) => ({
          id: marca.id,
          logoText: marca.logoText || marca.logotext,
          description: marca.description,
        }));
      } catch (e) {
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
        parsedTemario = [];
      }

      let parsedPreguntasFrecuentes = [];
      try {
        if (typeof courseToEdit.preguntas_frecuentes === "string") {
          parsedPreguntasFrecuentes = JSON.parse(
            courseToEdit.preguntas_frecuentes
          );
        } else if (Array.isArray(courseToEdit.preguntas_frecuentes)) {
          parsedPreguntasFrecuentes = courseToEdit.preguntas_frecuentes;
        }
      } catch (e) {
        parsedPreguntasFrecuentes = [];
      }

      const newFormData = {
        accion: "update",
        id: courseToEdit.curso.id,
        titulo: courseToEdit.curso.titulo || "",
        subtitulo: courseToEdit.curso.subtitulo || "",
        descripcion_corta: courseToEdit.curso.descripcion_corta || "",
        descripcion_larga: courseToEdit.curso.descripcion_larga || "",
        url_banner: courseToEdit.curso.url_banner || "",
        portada_targeta: courseToEdit.curso.portada_targeta || "", // Cargar URL de portada de tarjeta
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
        preguntas_frecuentes: parsedPreguntasFrecuentes,
      };
      setFormData(newFormData);
      setBannerFile(null);
      setCardCoverFile(null);
      setPreguntasFrecuentes(parsedPreguntasFrecuentes);
    if (courseToEdit.curso.portada_targeta) {
        }
    if (courseToEdit.curso.id) {
    }

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
      setCardCoverFile(null);
      setNewLogoText("");
      setNewDescription("");
      setNewTemaTitle("");
      setPreguntasFrecuentes([]);
      setNewPregunta("");
      setNewRespuesta("");
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

  const handleChangeCardCover = (e) => {
    const file =
      e.target.files && e.target.files.length > 0 ? e.target.files?.[0] : null;
    setCardCoverFile(file);
    setResponseMessage({ type: "", message: "" });
    setFormData((prevData) => ({
      ...prevData,
      portada_targeta: "", 
    }));
    };

  const handleAddMarcaPlataforma = () => {
    if (newLogoText && newDescription) {
      const newMarca = { logoText: newLogoText, description: newDescription };
      setFormData((prevData) => {
        const updatedMarcas = [...prevData.marca_plataforma, newMarca];
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
      setFormData((prevData) => ({
        ...prevData,
        marca_plataforma: prevData.marca_plataforma.filter(
          (marca) => marca.id !== idToRemove
        ),
      }));
      Swal.fire(
        "Eliminado!",
        "La marca ha sido eliminada localmente.",
        "success"
      );
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la marca permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/eliminarMarcaPlataformaController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accion: "delete",
              id: idToRemove,
            }),
          }
        );

        const data = await response.json();

        if (data.status === "success") {
          Swal.fire("Eliminado!", "La marca ha sido eliminada.", "success");
          setFormData((prevData) => ({
            ...prevData,
            marca_plataforma: prevData.marca_plataforma.filter(
              (marca) => marca.id !== idToRemove
            ),
          }));
        } else {
          Swal.fire("Error", `No se pudo eliminar: ${data.message}`, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Error de red al eliminar la marca.", "error");
      }
    }
  };

  const handleEditMarcaPlataforma = useCallback(
    (indexToEdit, updatedLogoText, updatedDescription) => {
      setFormData((prevData) => {
        const updatedMarcas = prevData.marca_plataforma.map((marca, index) =>
          index === indexToEdit
            ? {
                ...marca,
                logoText: updatedLogoText,
                description: updatedDescription,
              }
            : marca
        );
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

  const handleAddPreguntaFrecuente = useCallback(() => {
    if (newPregunta.trim() && newRespuesta.trim()) {
      const newFaq = {
        pregunta: newPregunta.trim(),
        respuesta: newRespuesta.trim(),
      };
      setPreguntasFrecuentes((prev) => [...prev, newFaq]);
      setNewPregunta("");
      setNewRespuesta("");
      setResponseMessage({ type: "", message: "" });
    } else {
      setResponseMessage({
        type: "error",
        message:
          "Por favor, rellena la pregunta y la respuesta para añadir una FAQ.",
      });
    }
  }, [newPregunta, newRespuesta, setResponseMessage]);

  const handleRemovePreguntaFrecuente = useCallback((indexToRemove) => {
    setPreguntasFrecuentes((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  const handleEditPreguntaFrecuente = useCallback((indexToEdit, updatedFaq) => {
    setPreguntasFrecuentes((prev) =>
      prev.map((faq, index) => (index === indexToEdit ? updatedFaq : faq))
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await submitCourse(
      formData,
      bannerFile,
      cardCoverFile,
      isEditing,
      preguntasFrecuentes
    );

    if (result.success) {
      if (!isEditing && result.id) {
        Swal.fire({
          title: "¡Curso Creado!",
          text: "Ahora puedes añadir las preguntas frecuentes para este curso.",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "Ir a FAQs",
          allowOutsideClick: false,
        }).then(() => {
          navigate(`/preguntas-frecuentes/${result.id}`);
        });
      } else {
        Swal.fire({
          title: "Operación Exitosa",
          text: result.message,
          icon: "success",
          confirmButtonText: "Entendido",
        }).then(() => {
          navigate("/mis-cursos", { state: { shouldRefresh: true } });
        });
      }
    } else {
      Swal.fire(
        "Error",
        result.message || "Ocurrió un error inesperado.",
        "error"
      );
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
    cardCoverFile,
    setCardCoverFile,
    isEditing,
    loading,
    uploadingBanner,
    uploadingCardCover,
    responseMessage,
    setResponseMessage,
    handleChange,
    handleFileChange,
    handleChangeCardCover,
    handleAddMarcaPlataforma,
    handleRemoveMarcaPlataforma,
    handleEditMarcaPlataforma,
    handleAddTema,
    handleRemoveTema,
    handleEditTema,
    handleSubmit,
    handleNavigateToMyCourses,
    isMobile,
    preguntasFrecuentes,
    newPregunta,
    setNewPregunta,
    newRespuesta,
    setNewRespuesta,
    handleAddPreguntaFrecuente,
    handleRemovePreguntaFrecuente,
    handleEditPreguntaFrecuente,
  };
};

export default useCourseFormLogic;