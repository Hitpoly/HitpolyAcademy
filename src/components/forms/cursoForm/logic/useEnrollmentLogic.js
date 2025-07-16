import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
  registerUser,
  loginUser,
  enrollUser,
  registerInterest,
  getCourseDetailsById,
  checkUserEnrollmentByTitle,
} from "../logic/api";
import { extractCourseIdFromSlug } from "../logic/courseUtils"; // Esta es la función clave

export const useEnrollmentLogic = (urlSlugFromParams) => {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [courseDetails, setCourseDetails] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const loadCourseAndEnrollmentStatus = async () => {
      setCheckingEnrollment(true);
      const courseIdFromUrl = extractCourseIdFromSlug(urlSlugFromParams); 

      if (!courseIdFromUrl) {
        Swal.fire({
          icon: "error",
          title: "Error de Curso",
          text: "No se pudo identificar el curso para la inscripción. Por favor, asegúrate de acceder a través de un enlace de curso válido.",
        });
        setCheckingEnrollment(false);
        return;
      }

      try {
        const courseResult = await getCourseDetailsById(courseIdFromUrl);

        if (courseResult.found) {
          setCourseDetails(courseResult.details);
          
          if (isAuthenticated && user?.id && courseResult.details.title) {
            const enrolled = await checkUserEnrollmentByTitle(user.id, courseResult.details.title);
            setIsEnrolled(enrolled);
            if (enrolled) {
              } else {
              }
          } else {
            setIsEnrolled(false);
          }
        } else {
          
          setCourseDetails(null);
          setIsEnrolled(false);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cargar el curso",
          text: `No se pudo cargar la información del curso: ${error.message}`,
        });
        setCourseDetails(null);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    loadCourseAndEnrollmentStatus();
  }, [urlSlugFromParams, isAuthenticated, user?.id]);

  const handleRegisterAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    const courseIdFromUrl = extractCourseIdFromSlug(urlSlugFromParams); // Y aquí también

    if (!courseIdFromUrl) {
      Swal.fire({
        icon: "error",
        title: "Error de Curso",
        text: "No se pudo identificar el curso para la inscripción. Por favor, asegúrate de acceder a través de un enlace de curso válido.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (isAuthenticated && user && isEnrolled) {
      Swal.fire({
        icon: "info",
        title: "Ya estás inscrito",
        text: "Parece que ya estás inscrito en este curso. Te estamos redirigiendo.",
      }).then(() => {
        navigate(`/master-full/${courseIdFromUrl}`);
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (isAuthenticated && user && !isEnrolled) {
      Swal.fire({
        icon: "info",
        title: "Ya estás registrado",
        text: "Parece que ya tienes una cuenta pero no estás inscrito en este curso. Por favor, completa tus datos adicionales para inscribirte.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const userTypeIdForRegistration = user?.user_type_id || 1;

    if (!userTypeIdForRegistration) {
      Swal.fire({
        icon: "error",
        title: "Error de Tipo de Usuario",
        text: "No se pudo determinar el tipo de usuario para el registro. Contacta a soporte.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const dataToRegisterUser = {
      accion: "registrarUsuario",
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      pass: values.pass,
      estado: "activo",
      id_tipo_usuario: userTypeIdForRegistration,
      telefono: values.telefono,
    };

    try {
      await registerUser(dataToRegisterUser);

      const loginData = {
        funcion: "login",
        email: values.email,
        pass: values.pass,
      };

      const userData = await loginUser(loginData);
      login(userData);

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Ahora, por favor, completa algunos datos adicionales para tu inscripción al curso.",
      }).then(() => {
        });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en el proceso",
        text: `Hubo un problema: ${error.message}`,
      });
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleUpdateInterestAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    const extractedCourseId = extractCourseIdFromSlug(urlSlugFromParams); // Y aquí también
    const parsedCourseToEnrollId = parseInt(extractedCourseId, 10);

    if (isNaN(parsedCourseToEnrollId)) {
      Swal.fire({
        icon: "error",
        title: "Error de ID de Curso",
        text: "No se pudo determinar un ID de curso válido para la inscripción. Por favor, asegúrate de acceder a través de un enlace de curso válido.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (!user || !user.id) {
      Swal.fire({
        icon: "error",
        title: "Error de Usuario",
        text: "No se pudo identificar tu usuario para registrar los intereses. Por favor, intenta iniciar sesión de nuevo.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (isAuthenticated && user && isEnrolled) {
      Swal.fire({
        icon: "info",
        title: "Ya estás inscrito",
        text: "Parece que ya estás inscrito en este curso. Te estamos redirigiendo.",
      }).then(() => {
        navigate(`/master-full/${parsedCourseToEnrollId}`);
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 19).replace("T", " ");

    const dataToRegisterInterest = {
      accion: "registrarIntereses",
      usuario_id: user.id,
      curso_id: parsedCourseToEnrollId,
      objetivo_curso: values.objetivo_curso,
      industria_actual: values.industria_actual,
      horas_dedicacion_semanal: parseInt(values.horas_dedicacion_semanal, 10),
      interes_adicional: values.interes_adicional || "",
      fecha_registro_interes: formattedDate,
    };

    try {
      await registerInterest(dataToRegisterInterest);
      await enrollUser({
        accion: "inscripciones",
        usuario_id: user.id,
        curso_id: parsedCourseToEnrollId,
        fecha_inscripcion: today.toISOString().slice(0, 10),
        progreso: 0,
        completado: 0,
        fecha_completado: null,
      });

      Swal.fire({
        icon: "success",
        title: "¡Información y curso asignados exitosamente! 🎉",
        text: "Tus datos han sido guardados y el curso ha sido asignado. ¡Bienvenido!",
      }).then(() => {
        navigate(`/master-full/${parsedCourseToEnrollId}`);
      });

      resetForm();
      setSnackbar({
        open: true,
        message: "¡Información guardada y curso asignado!",
        severity: "success",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en el proceso",
        text: `Hubo un problema: ${error.message}`,
      });
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return {
    loading,
    snackbar,
    handleCloseSnackbar,
    handleRegisterAndEnroll,
    handleUpdateInterestAndEnroll,
    isAuthenticated,
    user,
    navigate,
    extractCourseIdFromSlug,
    courseDetails,
    isEnrolled,
    checkingEnrollment,
  };
};