// src/hooks/useCourseData.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext'; // Asegúrate de que esta ruta sea correcta

const useCourseData = (refreshTrigger) => {
  const { user } = useAuth(); // Obtén el objeto 'user' del contexto de autenticación


  console.log("USUARIO:", user);
  

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dynamicEstadosDisponibles, setDynamicEstadosDisponibles] = useState([
    { value: '', label: 'Todos los Estados' }
  ]);

  // --- useEffect para cargar categorías ---
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('https://apiacademy.hitpoly.com/ajax/getCategoriasController.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ "accion": "getcategorias" }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP al cargar categorías: ${response.status}, mensaje: ${errorText}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.categorias)) {
          setCategorias([{ id: '', nombre: 'Todas las Categorías' }, ...data.categorias]);
        } else {
          setError(data.message || 'Error al cargar las categorías desde la API o formato inesperado.');
        }
      } catch (error) {
        setError('No se pudo conectar con el servidor para obtener las categorías o hubo un error de red.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategorias();
  }, []); // Se ejecuta solo una vez al montar

  // --- useEffect para cargar todos los cursos y recolectar estados ---
  useEffect(() => {
    const fetchAllCourses = async () => {
      setLoading(true);
      setError(null); // Limpiar errores anteriores

      // --- VERIFICACIÓN DEL ID DEL USUARIO ---
      if (!user || !user.id) {
        setLoading(false);
        setError("Usuario no autenticado o ID de usuario no disponible. No se pueden cargar los cursos.");
        setAllCourses([]);
        setDynamicEstadosDisponibles([{ value: '', label: 'Todos los Estados' }]);
        return; // Detiene la ejecución si no hay ID de usuario
      }
      // --- FIN VERIFICACIÓN DEL ID DEL USUARIO ---

      try {
        const response = await fetch('https://apiacademy.hitpoly.com/ajax/traerCursoYmarcaController.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'getCursosyMarca', id: user.id }), // ¡Aquí se usa el ID del usuario!
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // --- CAMBIO CLAVE AQUÍ: Acceder a data.cursos.cursos ---
        // Verificamos que 'data.cursos' sea un objeto y que dentro tenga la propiedad 'cursos' que sea un array
        if (data.status === 'success' && data.cursos && Array.isArray(data.cursos.cursos)) {
          const coursesArray = data.cursos.cursos; // ¡Accedemos al array real!

          setAllCourses(coursesArray);

          const uniqueEstados = new Set();
          coursesArray.forEach(item => { // Iteramos sobre el array de cursos
            if (item.curso && item.curso.estado) { // Accede al estado dentro del objeto 'curso'
              const estadoNormalizado = String(item.curso.estado).trim().toLowerCase();
              uniqueEstados.add(estadoNormalizado);
            }
          });

          const estadosParaFiltro = Array.from(uniqueEstados).map(estado => ({
            value: estado,
            label: estado.charAt(0).toUpperCase() + estado.slice(1)
          }));

          setDynamicEstadosDisponibles([{ value: '', label: 'Todos los Estados' }, ...estadosParaFiltro]);

        } else {
          // Esto se ejecuta si 'data.status' no es 'success' o si 'data.cursos.cursos' no es un array válido
          const message = data.message || 'Error al cargar los cursos o formato de datos inesperado (verifique la estructura "data.cursos.cursos").';
          setError(message);
          setAllCourses([]);
          setDynamicEstadosDisponibles([{ value: '', label: 'Todos los Estados' }]);
        }
      } catch (err) {
        setError(`No se pudieron cargar los cursos: ${err.message}`);
        setAllCourses([]);
        setDynamicEstadosDisponibles([{ value: '', label: 'Todos los Estados' }]);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingCategories) {
      fetchAllCourses();
    }
  }, [refreshTrigger, loadingCategories, user]); // Añade 'user' a las dependencias para que se ejecute cuando el usuario cambie/cargue

  return {
    allCourses,
    loading,
    error,
    categorias,
    loadingCategories,
    dynamicEstadosDisponibles,
    setAllCourses,
    setError
  };
};

export default useCourseData;