import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FaqSection = ({
  faqs,
  initialVisibleCount = 3,
  sectionTitle = "Preguntas Frecuentes",
}) => {
  const theme = useTheme();

  const [visibleFaqCount, setVisibleFaqCount] = useState(initialVisibleCount);
  const [expanded, setExpanded] = useState(false);

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
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ textAlign: "left" }}>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {showToggleButton && (
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
            ? `Mostrar todo ${faqs.length} Preguntas Frecuentes`
            : "Mostrar menos"}
        </Button>
      )}
    </Box>
  );
};

export default FaqSection;
