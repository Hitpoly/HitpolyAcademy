import React, { useState, useEffect } from "react";
import VideoLayout from "./layout"; 
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_GET_EXAMENES = "https://apiacademy.hitpoly.com/ajax/getExamenController.php";

const PasosIniciales = () => {
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalExamId, setFinalExamId] = useState(null);

  useEffect(() => {
    const fetchExamId = async () => {
      if (!courseId) {
        setError("No se ha especificado un ID de curso.");
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.post(API_GET_EXAMENES, { accion: "getExamen" });
        
        if (response.data.status === "success" && response.data.examenes) {

          const exam = response.data.examenes.find(
            (e) => String(e.curso_id) === String(courseId)
          );

          if (exam) {
            setFinalExamId(exam.id);
            } else {
            setFinalExamId(null);
          }
        } else {
          throw new Error(response.data.message || "Error al cargar la lista de exámenes.");
        }
      } catch (err) {
        setError(err.message || "Ocurrió un error al buscar el examen.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamId();
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Buscando examen del curso...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <VideoLayout courseId={courseId} finalExamId={finalExamId} />
    </Box>
  );
};

export default PasosIniciales;