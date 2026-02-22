import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const TestimonialCard = ({ review, onClick }) => (
  <Box
    onClick={() => onClick(review.text, review.name)}
    sx={{
      backgroundColor: "#F9FAFB",
      borderRadius: 4,
      p: 4,
      width: "100%",
      height: "100%",
      minHeight: "280px",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      cursor: "pointer",
      border: "1px solid #eee",
      boxSizing: "border-box",
      "&:hover": {
        transform: "translateY(-15px)",
        boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
        borderColor: "primary.main",
        backgroundColor: "#fff",
      },
    }}
  >
    <Typography
      variant="body1"
      sx={{
        mb: 3,
        fontStyle: "italic",
        color: "#374151",
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: 1.6,
      }}
    >
      "{review.text}"
    </Typography>

    <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar
        src={review.image}
        alt={review.name}
        sx={{
          width: 55,
          height: 55,
          bgcolor: "secondary.main",
          border: "2px solid #fff",
          boxShadow: 1,
        }}
      >
        {review.name.charAt(0)}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {review.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {review.program}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default TestimonialCard;