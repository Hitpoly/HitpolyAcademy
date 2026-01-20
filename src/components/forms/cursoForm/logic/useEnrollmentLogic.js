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
} from "./api";
import { extractCourseIdFromSlug } from "./courseUtils";

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

  const showToast = (icon, title) => {
    Swal.mixin({
      toast: true,
      position: 'bottom-start',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    }).fire({
      icon: icon,
      title: title
    });
  };

  useEffect(() => {
    const loadCourseAndEnrollmentStatus = async () => {
      setCheckingEnrollment(true);
      const courseIdFromUrl = extractCourseIdFromSlug(urlSlugFromParams);

      if (!courseIdFromUrl) {
        showToast("error", "Error: Curso no identificado.");
        setCheckingEnrollment(false);
        return;
      }

      try {
        const courseResult = await getCourseDetailsById(courseIdFromUrl);

        if (courseResult.found) {
          setCourseDetails(courseResult.details);

          if (isAuthenticated && user?.id && courseResult.details.title) {
            const enrolled = await checkUserEnrollmentByTitle(
              user.id,
              courseResult.details.title
            );
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
          showToast("warning", "Información del curso no encontrada.");
        }
      } catch (error) {
        showToast("error", `Error al cargar el curso: ${error.message}`);
        setCourseDetails(null);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    loadCourseAndEnrollmentStatus();
  }, [urlSlugFromParams, isAuthenticated, user?.id, navigate]);

  const handleRegisterAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" }); 

    const courseIdFromUrl = extractCourseIdFromSlug(urlSlugFromParams);
    const parsedCourseToEnrollId = parseInt(courseIdFromUrl, 10);

    if (isNaN(parsedCourseToEnrollId)) {
      showToast("error", "Error: ID de curso no válido.");
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (isAuthenticated) {
      showToast("info", "Ya estás registrado. Redirigiendo para completar la inscripción.");
      if (isEnrolled) {
        navigate(`/master-full/${parsedCourseToEnrollId}`);
      }
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const userTypeIdForRegistration = 3;

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
      console.log("🎉 Usuario registrado con éxito.");

      const loginData = {
        funcion: "login",
        email: values.email,
        pass: values.pass,
      };
      const loggedInUser = await loginUser(loginData);
      login(loggedInUser);
      const currentUserId = loggedInUser?.id;

      if (!currentUserId) {
        throw new Error("No se pudo obtener el ID del usuario recién registrado para la inscripción.");
      }

      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 19).replace("T", " ");

      const dataToRegisterInterest = {
        accion: "registrarIntereses",
        usuario_id: currentUserId,
        curso_id: parsedCourseToEnrollId,
        objetivo_curso: values.objetivo_curso || "",
        industria_actual: values.industria_actual || "",
        horas_dedicacion_semanal: parseInt(values.horas_dedicacion_semanal, 10) || 0,
        interes_adicional: values.interes_adicional || "",
        fecha_registro_interes: formattedDate,
      };
      await registerInterest(dataToRegisterInterest);
      await enrollUser({
        accion: "inscripciones",
        usuario_id: currentUserId,
        curso_id: parsedCourseToEnrollId,
        fecha_inscripcion: today.toISOString().slice(0, 10),
        progreso: 0,
        completado: 0,
        fecha_completado: null,
      });
      
      showToast("success", "¡Bienvenido! Registro e inscripción completados. 🎉");
      navigate(`/master-full/${parsedCourseToEnrollId}`);

      resetForm();
      } catch (error) {
      showToast("error", `Error en el proceso: ${error.message}`);
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

    const extractedCourseId = extractCourseIdFromSlug(urlSlugFromParams);
    const parsedCourseToEnrollId = parseInt(extractedCourseId, 10);

    if (isNaN(parsedCourseToEnrollId)) {
      showToast("error", "Error: ID de curso no válido.");
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (!isAuthenticated || !user || !user.id) {
      showToast("error", "Error de usuario. Por favor, inicia sesión de nuevo.");
      setLoading(false);
      setSubmitting(false);
      return;
    }

    if (isEnrolled) {
      showToast("info", "Ya estás inscrito en este curso. Redirigiendo.");
      navigate(`/master-full/${parsedCourseToEnrollId}`);
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
      showToast("success", "¡Información y curso asignados exitosamente! 🎉");
      navigate(`/master-full/${parsedCourseToEnrollId}`);

      resetForm();
      } catch (error) {
      showToast("error", `Error en el proceso: ${error.message}`);
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