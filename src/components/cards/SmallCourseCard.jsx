import React, { useState } from "react";
import { Box, Typography, Card, CardMedia, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SmallCourseCard = ({ course, horizontal = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleGoToCourse = () => {
    navigate(`/curso/${course.id}`);
    window.scrollTo(0, 0);
  };

  if (horizontal) {
    return (
      <Card
        onClick={handleGoToCourse}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          overflow: "hidden",
          width: "100%",
          minHeight: { xs: "auto", sm: 120 },
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: '1px solid #f0f0f0',
          "&:hover": { 
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            borderColor: '#F21C63'
          }
        }}
      >
        <CardMedia
          component="img"
          image={course.banner || course.portada_targeta}
          sx={{ 
            width: { xs: "100%", sm: 220 }, 
            aspectRatio: { xs: "16/9", sm: "auto" },
            height: { sm: "auto" },
            objectFit: "cover" 
          }}
        />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="800" 
            sx={{ 
              color: "#1c1d1f", 
              mb: 0.5,
              fontSize: '1rem',
              lineHeight: 1.2
            }}
          >
            {course.title}
          </Typography>
          <Typography variant="body2" color="#F21C63" fontWeight="800" sx={{ mb: 1 }}>
            {course.price}
          </Typography>
          <Typography variant="caption" sx={{ color: '#F21C63', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Ver curso completo →
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "relative",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
        width: "100%",
        aspectRatio: "16/9",
        bgcolor: "#000",
        cursor: "pointer",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
        }
      }}
    >
      <CardMedia
        component="img"
        image={course.banner || course.portada_targeta}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isHovered ? 0.7 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Overlay al hacer hover */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 2,
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleGoToCourse();
          }}
          sx={{
            bgcolor: "#F21C63",
            "&:hover": { bgcolor: "#d41857" },
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "20px",
            fontSize: "0.75rem",
            boxShadow: "0 4px 10px rgba(242, 28, 99, 0.4)"
          }}
        >
          Ver más
        </Button>
      </Box>
    </Card>
  );
};

export default SmallCourseCard;
