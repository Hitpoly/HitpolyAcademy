import React, { useState, useEffect, useCallback } from "react"; // Asegúrate de importar useEffect y useCallback
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  useTheme,
  CircularProgress,
  Alert, 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FaqSection = ({
  courseId,
  initialVisibleCount = 3,
  sectionTitle = "Preguntas Frecuentes",
}) => {
  const theme = useTheme();

  const [faqs, setFaqs] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [visibleFaqCount, setVisibleFaqCount] = useState(initialVisibleCount);
  const [expanded, setExpanded] = useState(false);

  const fetchFaqs = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        
        const response = await fetch(
          "https://apiacademy.hitpoly.com/ajax/getPreguntasYrespuestasController.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "getRespuestas", id }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error de red: ${response.status} - ${response.statusText}. Mensaje: ${errorText}`
          );
        }

        const rawText = await response.text();
        
        const data = JSON.parse(rawText);
        
        if (data.status === "success") {
          setFaqs(data.preguntasyrespuestas || []);
        } else {
          setError(data.message || "No se pudieron cargar las FAQs.");
          setFaqs([]); 
        }
      } catch (err) {
        setError(
          `Error al cargar las FAQs: ${err.message}. Inténtalo de nuevo.`
        );
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  
  useEffect(() => {
    if (courseId) {
      fetchFaqs(courseId);
    } else {
      setLoading(false);
      setError("ID del curso no proporcionado para cargar FAQs.");
      setFaqs([]);
    }
  }, [courseId, fetchFaqs]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleToggleFaqs = () => {
    if (visibleFaqCount === initialVisibleCount) {
      setVisibleFaqCount(faqs.length);
    } else {
      setVisibleFaqCount(initialVisibleCount);
      setExpanded(false);
    }
  };

  const displayedFaqs = faqs.slice(0, visibleFaqCount);
  const showToggleButton = faqs.length > initialVisibleCount;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        p: { xs: 2, md: 4 },
        mt: 5,
        mb: 8,
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 4,
          textAlign: { xs: "center", md: "left" },
          color: theme.palette.text.primary,
        }}
      >
        {sectionTitle}
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando preguntas frecuentes...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && faqs.length === 0 && (
        <Alert severity="info" sx={{ my: 4 }}>
          Este curso aún no tiene preguntas frecuentes registradas.
        </Alert>
      )}

      {!loading && !error && faqs.length > 0 && (
        <Stack spacing={2}>
          {displayedFaqs.map((faq, index) => (
            <Accordion
              key={faq.id || `faq-${index}`} 
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}bh-content`}
                id={`panel${index}bh-header`}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    my: 1,
                    justifyContent: "flex-start",
                    textAlign: "left",
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: "1.2rem",
                    color: theme.palette.primary.main,
                    flexGrow: 1,
                  }}
                >
                  {faq.pregunta}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ textAlign: "left" }}>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {faq.respuesta}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {!loading && !error && showToggleButton && (
        <Button
          variant="text"
          onClick={handleToggleFaqs}
          sx={{
            mt: 4,
            width: "100%",
            py: 1.5,
            color: theme.palette.primary.main,
            fontWeight: "bold",
            fontSize: "1rem",
            textTransform: "none",
          }}
        >
          {visibleFaqCount === initialVisibleCount
            ? `Mostrar todo (${faqs.length} Preguntas Frecuentes)`
            : "Mostrar menos"}
        </Button>
      )}
    </Box>
  );
};

export default FaqSection;