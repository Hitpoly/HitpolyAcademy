// src/utils/api.js

export const parseApiResponse = async (response) => {
  try {
    const json = await response.json();
    return json;
  } catch (error) {
    const text = await response.text();
    if (text.trim() === "") {
      throw new Error("La API devolvió una respuesta vacía.");
    }
    throw new Error(
      `La API devolvió un formato inesperado o JSON inválido. Contenido: "${text.substring(
        0,
        200
      )}..."`
    );
  }
};

export const registerUser = async (userData) => {
  const response = await fetch(
    "https://apiacademy.hitpoly.com/ajax/registerUsuarioController.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage =
      errorData.message ||
      `Error ${response.status}: Fallo al registrar el usuario.`;
    throw new Error(errorMessage);
  }

  const result = await parseApiResponse(response);
  if (result.status !== "success") {
    throw new Error(result.message || "Fallo en el registro del usuario.");
  }
  return result;
};

export const loginUser = async (loginData) => {
  const response = await fetch(
    "https://apiacademy.hitpoly.com/ajax/usuarioController.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }
  );

  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage =
      errorData.message ||
      `Error ${response.status}: Fallo en el inicio de sesión.`;
    throw new Error(errorMessage);
  }

  const result = await parseApiResponse(response);
  if (result.status === "success") {
    return result.user;
  } else {
    throw new Error(
      result.message || "No se pudo iniciar sesión. Credenciales inválidas."
    );
  }
};

export const enrollUser = async (enrollmentData) => {
  const response = await fetch(
    "https://apiacademy.hitpoly.com/ajax/cargarInscripcionController.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollmentData),
    }
  );

  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage =
      errorData.message ||
      `Error ${response.status}: Fallo al inscribir al usuario en el curso.`;
    throw new Error(errorMessage);
  }

  const result = await parseApiResponse(response);
  if (result.status === "success" || result.status === "warning") {
    return result;
  } else {
    throw new Error(
      result.message || "La inscripción al curso no fue exitosa."
    );
  }
};

export const registerInterest = async (interestData) => {
  const response = await fetch(
    "https://apiacademy.hitpoly.com/ajax/cargarDatosUserController.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(interestData),
    }
  );

  if (!response.ok) {
    const errorData = await parseApiResponse(response);
    const errorMessage =
      errorData.message ||
      `Error ${response.status}: Fallo al registrar los datos de interés.`;
    throw new Error(errorMessage);
  }

  const result = await parseApiResponse(response);
  if (result.status !== "success") {
    throw new Error(
      result.message || "Fallo al registrar los datos de interés."
    );
  }
  return result;
};

export const getUserEnrollmentsAndTitles = async (userId) => {
  console.log(
    `🔎 getUserEnrollmentsAndTitles: Intentando obtener cursos inscritos para Usuario ID: ${userId}`
  );
  try {
    const response = await fetch(
      "https://apiacademy.hitpoly.com/ajax/getInfoUserController.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getInfo", id: userId }),
      }
    );

    if (!response.ok) {
      const errorData = await parseApiResponse(response);
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Fallo al obtener los cursos inscritos del usuario.`
      );
    }

    const result = await parseApiResponse(response);

    if (result.status === "success" && Array.isArray(result.cursos)) {
      const enrolledCoursesInfo = result.cursos.map((curso) => ({
        id: curso.id,
        titulo: curso.titulo,
      }));
      return enrolledCoursesInfo;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

export const getAllCourses = async () => {
  try {
    const response = await fetch(
      "https://apiacademy.hitpoly.com/ajax/traerCursosController.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "getCursos" }),
      }
    );

    if (!response.ok) {
      const errorData = await parseApiResponse(response);
      throw new Error(
        errorData.message ||
          `Error ${response.status}: Fallo al obtener todos los cursos disponibles.`
      );
    }

    const result = await parseApiResponse(response);
    if (
      result.status === "success" &&
      result.cursos &&
      Array.isArray(result.cursos.cursos)
    ) {
      return result.cursos.cursos;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

export const getCourseDetailsById = async (courseId) => {
  try {
    const allCourses = await getAllCourses();
    const foundCourse = allCourses.find(
      (course) => String(course.id) === String(courseId)
    ); // Busca el curso por ID (comparando como string por si acaso)

    if (foundCourse) {
      return {
        found: true,
        details: {
          title: foundCourse.titulo,
          subtitle: foundCourse.subtitulo || "",
        },
      };
    } else {
      return { found: false, details: null };
    }
  } catch (error) {
    throw error;
  }
};

export const checkUserEnrollmentByTitle = async (
  userId,
  courseTitleToCheck
) => {
  try {
    const userEnrolledCourses = await getUserEnrollmentsAndTitles(userId);

    const isEnrolled = userEnrolledCourses.some(
      (enrolledCourse) => enrolledCourse.titulo === courseTitleToCheck
    );

    if (isEnrolled) {
    } else {
    }

    return isEnrolled;
  } catch (error) {
    return false;
  }
};
