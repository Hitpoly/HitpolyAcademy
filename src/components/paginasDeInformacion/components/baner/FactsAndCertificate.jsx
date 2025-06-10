import React from "react";
import { Box, Typography } from "@mui/material";

const FactsAndCertificate = ({ certificate, facts }) => {
  return (
    <Box
      sx={{
        py: 8,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center",
        alignItems: "flex-start",
        gap: { xs: 6, md: 8 },
        maxWidth: "lg",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: { xs: "100%", md: "400px" },
          maxWidth: { xs: "100%", md: "50%" },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {certificate.title}
        </Typography>
        {certificate.paragraphs.map((paragraph, index) => (
          <Typography key={index} variant="body1" paragraph>
            {paragraph}
          </Typography>
        ))}
        {certificate.note && (
          <Typography variant="body2" color="text.secondary">
            {certificate.note}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: { xs: "100%", md: "400px" },
          maxWidth: { xs: "100%", md: "50%" },
          px: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {facts.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 4, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          {facts.items.map((fact, index) => (
            <Box
              key={index}
              sx={{
                borderLeft: "3px solid #FFD700",
                pl: 2,
                flex: 1,
                minWidth: { xs: '100%', sm: 'calc(50% - 16px)' },
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {fact.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {fact.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fact.source}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FactsAndCertificate;