import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Hook personalizado para manejar la lógica del formulario de inscripción.
 * Proporciona estados, funciones y efectos relacionados con el registro
 * de usuarios, la inscripción en cursos y la gestión de intereses.
 *
 * @param {number} initialDefaultUserTypeId - El ID de tipo de usuario por defecto. Por defecto es 3.
 */
export const useEnrollmentFormLogic = (initialDefaultUserTypeId = 3) => {
  // --- Estados y Hooks ---
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  // Ahora capturamos el parámetro como 'slug' para ser explícitos, asumiendo tu ruta es /curso/:slug
  const { slug: urlCourseSlugFromParams } = useParams();

  // Nuevo estado para almacenar el ID numérico del curso una vez extraído
  const [numericCourseId, setNumericCourseId] = useState(null);

  console.log("LOGIC INIT: Hook useEnrollmentFormLogic inicializado.");
  console.log("LOGIC INIT: urlCourseSlugFromParams raw:", urlCourseSlugFromParams);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- Funciones Auxiliares ---

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const enrollUserInCourse = async (userId, courseId) => {
    console.log("ENROLL: Iniciando enrollUserInCourse.");
    console.log("ENROLL: userId:", userId, "courseId:", courseId);

    const today = new Date().toISOString().slice(0, 10);
    const dataToEnrollCourse = {
      accion: "inscripciones",
      usuario_id: userId,
      curso_id: parseInt(courseId, 10), // Convertir a número aquí
      fecha_inscripcion: today,
      progreso: 0,
      completado: 0,
      fecha_completado: null,
    };

    console.log("ENROLL: Datos enviados a cargarInscripcionController.php:", dataToEnrollCourse);

    try {
      const enrollResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/cargarInscripcionController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToEnrollCourse),
        }
      );

      if (!enrollResponse.ok) {
        const enrollErrorText = await enrollResponse.text();
        console.error(
          "ENROLL ERROR: cargarInscripcionController.php - Respuesta NO OK. Texto crudo:",
          enrollErrorText
        );
        let enrollErrorMessage =
          "Error desconocido al inscribir al usuario en el curso.";
        try {
          const enrollErrorJson = JSON.parse(enrollErrorText);
          enrollErrorMessage = enrollErrorJson.message || enrollErrorMessage;
        } catch (parseError) {
          console.error(
            "ENROLL ERROR: cargarInscripcionController.php - Error al parsear JSON (respuesta inesperada):",
            parseError.message
          );
          enrollErrorMessage = `La API de inscripción devolvió un error inesperado (no JSON). Respuesta: "${enrollErrorText.substring(
            0,
            150
          )}..."`;
        }
        throw new Error(enrollErrorMessage);
      }

      const enrollResultData = await enrollResponse.json();
      console.log("ENROLL SUCCESS: cargarInscripcionController.php - Respuesta JSON OK:", enrollResultData);

      if (enrollResultData.status !== "success") {
        throw new Error(
          enrollResultData.message || "La inscripción al curso no fue exitosa."
        );
      }
      return enrollResultData;
    } catch (error) {
      console.error("ENROLL CATCH: Error en enrollUserInCourse:", error.message);
      throw error; // Re-lanza el error para que sea capturado por el manejador principal
    }
  };

  // --- Manejadores de Eventos y Lógica Principal ---

  const handleRegisterAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    console.log("REGISTER: handleRegisterAndEnroll iniciado.");
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    // Usamos el ID numérico extraído
    const courseToEnrollId = numericCourseId;
    console.log("REGISTER: courseToEnrollId (numérico) para registro:", courseToEnrollId);

    if (!courseToEnrollId || isNaN(courseToEnrollId)) {
      console.error("REGISTER ERROR: ID de curso numérico no válido o faltante para registro.");
      Swal.fire({
        icon: "error",
        title: "Error: ID de Curso No Disponible",
        text: "No se pudo obtener el ID del curso. Por favor, asegúrate de acceder a esta página desde un enlace de curso válido.",
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
      id_tipo_usuario: initialDefaultUserTypeId,
      telefono: values.telefono,
    };

    console.log("REGISTER: Datos enviados a registerUsuarioController.php:", dataToRegisterUser);

    try {
      const registerResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/registerUsuarioController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToRegisterUser),
        }
      );

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error(
          "REGISTER ERROR: registerUsuarioController.php - Respuesta NO OK. Texto crudo:",
          errorText
        );
        let errorMessage = "Error desconocido al registrar el usuario.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
          console.error(
            "REGISTER ERROR: registerUsuarioController.php - Error al parsear JSON (respuesta inesperada):",
            parseError.message
          );
          errorMessage = `La API devolvió un error inesperado (no JSON). Respuesta: "${errorText.substring(
            0,
            150
          )}..."`;
        }
        throw new Error(errorMessage);
      }

      const registerResult = await registerResponse.json();
      console.log("REGISTER SUCCESS: registerUsuarioController.php - Respuesta JSON OK:", registerResult);

      if (registerResult.status !== "success") {
        throw new Error(
          registerResult.message || "Fallo en el registro del usuario."
        );
      }

      // --- LOGIN AUTOMÁTICO DESPUÉS DEL REGISTRO EXITOSO ---
      const loginData = {
        funcion: "login",
        email: values.email,
        pass: values.pass,
      };

      console.log("REGISTER: Iniciando login automático con usuarioController.php");

      const loginResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/usuarioController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      if (!loginResponse.ok) {
        const loginErrorText = await loginResponse.text();
        console.error(
          "LOGIN ERROR: usuarioController.php (login) - Respuesta NO OK. Texto crudo:",
          loginErrorText
        );
        let loginErrorMessage =
          "Error desconocido al intentar login automático.";
        try {
          const loginErrorJson = JSON.parse(loginErrorText);
          loginErrorMessage = loginErrorJson.message || loginErrorMessage;
        } catch (parseError) {
          console.error(
            "LOGIN ERROR: usuarioController.php (login) - Error al parsear JSON (respuesta inesperada):",
            parseError.message
          );
          loginErrorMessage = `La API de login devolvió un error inesperado (no JSON). Respuesta: "${loginErrorText.substring(
            0,
            150
          )}..."`;
        }
        throw new Error(loginErrorMessage);
      }

      const loginResult = await loginResponse.json();
      console.log("LOGIN SUCCESS: usuarioController.php (login) - Respuesta JSON OK:", loginResult);

      if (loginResult.status === "success") {
        const userData = loginResult.user;
        login(userData); // Actualiza el contexto de autenticación
        console.log("LOGIN SUCCESS: Usuario autenticado. Redirigiendo a formulario de intereses.");

        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Ahora, por favor, completa algunos datos adicionales para tu inscripción al curso.",
        });
      } else {
        console.error("LOGIN FAIL: Login automático no exitoso:", loginResult.text);
        Swal.fire({
          icon: "error",
          title: "Error de inicio de sesión automático",
          text:
            loginResult.text ||
            "No se pudo iniciar sesión automáticamente después del registro. Inténtelo manualmente.",
        });
        setSnackbar({
          open: true,
          message:
            loginResult.text || "Error al iniciar sesión automáticamente.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("GENERAL ERROR: Error GENERAL en handleRegisterAndEnroll:", error);
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
      console.log("REGISTER: handleRegisterAndEnroll finalizado.");
    }
  };

  const handleUpdateInterestAndEnroll = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    console.log("INTEREST: handleUpdateInterestAndEnroll iniciado.");
    setLoading(true);
    setSubmitting(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    // Usamos el ID numérico extraído
    const courseToEnrollId = numericCourseId;
    console.log("INTEREST: courseToEnrollId (numérico) para intereses:", courseToEnrollId);

    if (!courseToEnrollId || isNaN(courseToEnrollId)) {
      console.error("INTEREST ERROR: ID de curso numérico no válido o faltante para intereses.");
      Swal.fire({
        icon: "error",
        title: "Error: ID de Curso No Disponible",
        text: "No se encontró un ID de curso válido para la inscripción. Por favor, intenta de nuevo desde la página del curso.",
      });
      setLoading(false);
      setSubmitting(false);
      return;
    }

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 19).replace("T", " ");

    const dataToRegisterInterest = {
      accion: "registrarIntereses",
      usuario_id: user.id, // Se asume que `user` está disponible a través de `useAuth`
      curso_id: courseToEnrollId,
      objetivo_curso: values.objetivo_curso,
      industria_actual: values.industria_actual,
      horas_dedicacion_semanal: parseInt(values.horas_dedicacion_semanal, 10),
      interes_adicional: values.interes_adicional || "",
      fecha_registro_interes: formattedDate,
    };

    console.log("INTEREST: Datos enviados a cargarDatosUserController.php:", dataToRegisterInterest);

    try {
      const interestResponse = await fetch(
        "https://apiacademy.hitpoly.com/ajax/cargarDatosUserController.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToRegisterInterest),
        }
      );

      if (!interestResponse.ok) {
        const errorText = await interestResponse.text();
        console.error(
          "INTEREST ERROR: cargarDatosUserController.php - Respuesta NO OK. Texto crudo:",
          errorText
        );
        let errorMessage =
          "Error desconocido al registrar los datos de interés.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
          console.error(
            "INTEREST ERROR: cargarDatosUserController.php - Error al parsear JSON (respuesta inesperada):",
            parseError.message
          );
          errorMessage = `La API de intereses devolvió un error inesperado (no JSON). Respuesta: "${errorText.substring(
            0,
            150
          )}..."`;
        }
        throw new Error(errorMessage);
      }

      const interestResult = await interestResponse.json();
      console.log("INTEREST SUCCESS: cargarDatosUserController.php - Respuesta JSON OK:", interestResult);

      if (interestResult.status !== "success") {
        throw new Error(
          interestResult.message || "Fallo al registrar los datos de interés."
        );
      }

      // Procede a inscribir al usuario en el curso una vez que los intereses se guardaron
      console.log("INTEREST: Intereses registrados. Procediendo a la inscripción del curso.");
      await enrollUserInCourse(user.id, courseToEnrollId);

      Swal.fire({
        icon: "success",
        title: "¡Información y curso asignados exitosamente!",
        text: "Tus datos han sido guardados y el curso ha sido asignado. ¡Bienvenido!",
      }).then(() => {
        console.log("INTEREST SUCCESS: Redirigiendo a /master-full/".concat(courseToEnrollId));
        navigate(`/master-full/${courseToEnrollId}`);
      });

      resetForm();
      setSnackbar({
        open: true,
        message: "¡Información guardada y curso asignado!",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "GENERAL ERROR: Error GENERAL en handleUpdateInterestAndEnroll:",
        error
      );
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
      console.log("INTEREST: handleUpdateInterestAndEnroll finalizado.");
    }
  };

  // --- Efectos ---

  // Efecto para extraer el ID numérico del slug de la URL
  useEffect(() => {
    console.log("USEEFFECT: Ejecutando useEffect para extraer ID de curso del slug.");
    console.log("USEEFFECT: urlCourseSlugFromParams en useEffect:", urlCourseSlugFromParams);

    if (urlCourseSlugFromParams) {
      // Intenta extraer los dígitos al final del slug
      const match = urlCourseSlugFromParams.match(/(\d+)$/);
      if (match && match[1]) {
        const extractedId = parseInt(match[1], 10);
        if (!isNaN(extractedId)) {
          console.log("USEEFFECT: ID numérico extraído del slug:", extractedId);
          setNumericCourseId(extractedId);
          return; // ID numérico encontrado, no es necesario seguir
        }
      }
      
      // Si no se pudo extraer un ID válido del slug, o si el slug es inválido
      console.error("USEEFFECT ERROR: No se pudo extraer un ID de curso válido del slug:", urlCourseSlugFromParams);
      Swal.fire({
        icon: "error",
        title: "ID de Curso Inválido",
        text: "El enlace del curso no contiene un ID válido. Por favor, asegúrate de acceder desde un enlace de curso correcto.",
      }).then(() => {
        navigate("/cursos"); // Redirige a una página donde el usuario pueda seleccionar un curso
        console.log("USEEFFECT: Redirección completada a /cursos.");
      });

    } else {
      // Si urlCourseSlugFromParams es nulo o vacío
      console.error("USEEFFECT ERROR: Redirigiendo. Slug de curso no encontrado en la URL.");
      Swal.fire({
        icon: "error",
        title: "ID de Curso Requerido",
        text: "Para inscribirte, debes acceder a esta página desde el enlace de un curso válido. El ID del curso no se encontró o es inválido en la URL.",
      }).then(() => {
        navigate("/cursos");
        console.log("USEEFFECT: Redirección completada a /cursos.");
      });
    }
  }, [urlCourseSlugFromParams, navigate]); // Dependencias del useEffect

  // Efecto para redirigir si numericCourseId aún no está establecido después de un breve tiempo
  // Esto actúa como un "fall-safe" si la extracción o validación inicial fallan por alguna razón.
  useEffect(() => {
    let timer;
    if (urlCourseSlugFromParams && numericCourseId === null) {
      timer = setTimeout(() => {
        if (numericCourseId === null) { // Volvemos a verificar por si se actualizó
          console.warn("USEEFFECT WARNING: numericCourseId no se estableció después de 3 segundos. Redirigiendo.");
          Swal.fire({
            icon: "error",
            title: "Problema al cargar curso",
            text: "No se pudo obtener el ID del curso para continuar. Por favor, reintenta o contacta a soporte.",
          }).then(() => {
            navigate("/cursos");
          });
        }
      }, 3000); // 3 segundos de espera
    }
    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta o el ID se establece
  }, [numericCourseId, urlCourseSlugFromParams, navigate]);


  // --- Valores de Retorno del Hook ---

  // Determinar el ID del curso para mostrar en el título (usando el ID numérico resuelto)
  const displayCourseId =
    numericCourseId && !isNaN(parseInt(numericCourseId, 10))
      ? numericCourseId
      : "desconocido";

  console.log("LOGIC RENDER: Valores de retorno del hook. displayCourseId:", displayCourseId);

  return {
    isAuthenticated,
    user,
    loading,
    snackbar,
    handleCloseSnackbar,
    handleRegisterAndEnroll,
    handleUpdateInterestAndEnroll,
    displayCourseId,
    urlCourseSlugFromParams, // Exportamos el slug si es necesario para el componente
    numericCourseId, // Exportamos el ID numérico resuelto para uso del componente
  };
};