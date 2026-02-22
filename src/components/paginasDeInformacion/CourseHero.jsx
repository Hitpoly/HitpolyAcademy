import React from "react";
import { Box } from "@mui/material";
import ProgrammeDetailsBanner from "../banners/infoCurso";
import EnrollmentForm from "../forms/cursoForm/EnrollmentForm";

const CourseHero = ({ urlBanner, programmeDetails }) => {
  return (
    <Box
      sx={{
        height: "100%",
        backgroundImage: `url(${urlBanner || "images/fondoCursos.jpg"})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        padding: { xs: "20px", md: "80px 150px" },
        display: "flex",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          backgroundColor: "#FFFFFF",
          borderRadius: "25px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          gap: { xs: 0, md: 10 },
          width: "100%"
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "65%" } }}>
          <ProgrammeDetailsBanner {...programmeDetails} />
        </Box>
        <Box
          id="enrollment-form"
          sx={{
            width: { xs: "100%", md: "35%" },
            backgroundColor: "#f4f4f4",
            borderRadius: { xs: "0px 0px 25px 25px", md: "0px 25px 25px 0px" },
          }}
        >
          <EnrollmentForm />
        </Box>
      </Box>
    </Box>
  );
};

export default CourseHero;