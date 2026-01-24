import React from "react";
import { Box, Button } from "@mui/material";

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", borderBottom: "1px solid #ddd" }}>
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onCategoryChange(category)}
          sx={{
            flex: 1,
            py: 2,
            borderRadius: 0,
            textTransform: "none",
            fontWeight: "bold",
            bgcolor: activeCategory === category ? "#6F4CE0" : "transparent",
            color: activeCategory === category ? "#fff" : "#6F4CE0",
            "&:hover": {
              bgcolor: activeCategory === category ? "#5a3ecc" : "#f8f9fa",
            },
          }}
        >
          {category}
        </Button>
      ))}
    </Box>
  );
};

export default CategoryTabs;