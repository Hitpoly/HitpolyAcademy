import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ProgressAccordion = ({ panels }) => {
  const [expanded, setExpanded] = useState(panels[0]?.id);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const accordionRef = useRef(null);

  const handleChange = (panel) => (event, newExpanded) => {
    setManualOpen(newExpanded);
    setExpanded(newExpanded ? panel : false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoading(true);
          } else {
            setIsLoading(false);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (accordionRef.current) {
      observer.observe(accordionRef.current);
    }

    return () => {
      if (accordionRef.current) {
        observer.unobserve(accordionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval;

    if (expanded && !manualOpen && isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(interval);
            const nextPanelIndex =
              panels.findIndex((panel) => panel.id === expanded) + 1;
            if (nextPanelIndex < panels.length) {
              setExpanded(panels[nextPanelIndex].id);
            } else {
              setExpanded(panels[0].id);
            }
            return 100;
          }
          return Math.min(oldProgress + 5, 100);
        });
      }, 700);
    }

    return () => clearInterval(interval);
  }, [expanded, manualOpen, isLoading, panels]);

  return (
    <div ref={accordionRef}>
      {panels.map((panel) => (
        <Accordion
          key={panel.id}
          expanded={expanded === panel.id}
          onChange={handleChange(panel.id)}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            "&:before": {
              display: "none",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${panel.id}-content`}
            id={`${panel.id}-header`}
            sx={{
              position: "relative",
              zIndex: 1,
              padding: "0px 10px",
              backgroundColor: "transparent",
              color: "#211E26",
              border: "none",
              borderBottom: "none",
            }}
          >
            <Typography variant="h6">{panel.title}</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              position: "relative",
              backgroundColor: "transparent",
              color: "text.secondary",
              border: "none",
              borderBottom: "none",
            }}
          >
            <Typography>{panel.content}</Typography>
          </AccordionDetails>
          {expanded === panel.id && isLoading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: `${progress}%`,
                backgroundColor: "#3f51b5",
                transition: "height 0.1s ease-in-out",
              }}
            />
          )}
        </Accordion>
      ))}
    </div>
  );
};

export default ProgressAccordion;
