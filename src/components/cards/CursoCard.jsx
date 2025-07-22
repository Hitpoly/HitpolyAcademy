import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Tooltip,
} from "@mui/material";

const CursoCard = ({
  title,
  subtitle,
  banner,
  accessLink,
  instructorName,
  rating,
  reviews,
  students,
  totalHours,
  price,
  level,
}) => {
  return (
    <Card
      sx={{
        width: 300,
        minWidth: 200,
        maxWidth: 300,
        height: "auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
        overflow: "hidden",
      }}
    >
      {banner && (
        <CardMedia
          component="img"
          height="140"
          image={banner}
          alt={title}
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "12px",
          paddingBottom: "12px !important",
        }}
      >
        <Box>
          <Tooltip title={title} placement="top">
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.3em",
                minHeight: "2.6em",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.05rem" },
                mb: 0.5,
                color: "#1c1d1f",
              }}
            >
              {title}
            </Typography>
          </Tooltip>

          {instructorName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontSize: "0.8rem" }}
            >
              {instructorName}
            </Typography>
          )}

          {subtitle && (
            <Tooltip title={subtitle} placement="bottom">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.4,
                  minHeight: "2.8em",
                  fontSize: "0.85rem",
                  mb: 1,
                }}
              >
                {subtitle}
              </Typography>
            </Tooltip>
          )}

          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            {rating && (
              <Typography
                variant="body2"
                color="orange"
                sx={{ fontWeight: "bold", mr: 0.5, fontSize: "0.9rem" }}
              >
                {rating}
              </Typography>
            )}
            {rating && (
              <Rating
                name="read-only"
                value={parseFloat(rating)}
                precision={0.1}
                readOnly
                size="small"
                sx={{ color: "#e59819" }}
              />
            )}
            {reviews && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5, fontSize: "0.8rem" }}
              >
                ({reviews})
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: "wrap" }}>
            {students && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.8rem", mr: 1, whiteSpace: "nowrap" }}
              >
                {students} estudiantes
              </Typography>
            )}
            {totalHours && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.8rem", mr: 1, whiteSpace: "nowrap" }}
              >
                {totalHours}
              </Typography>
            )}
            {level && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.8rem",
                  ml: (students || totalHours) ? 0.5 : 0,
                  border: "1px solid #d1d7dc",
                  borderRadius: "3px",
                  px: 0.5,
                  py: 0.2,
                  whiteSpace: "nowrap",
                }}
              >
                {level}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            pt: 1,
          }}
        >
          {price && (
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: "#1c1d1f",
                fontSize: "1.2rem",
              }}
            >
              {price}
            </Typography>
          )}
          <Button
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "transparent",
              color: "#1c1d1f",
              borderColor: "#1c1d1f",
              padding: "8px 16px",
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: "bold",
              width: "100%",
              "&:hover": {
                backgroundColor: "#f7f9fa",
                borderColor: "#1c1d1f",
              },
            }}
            href={accessLink}
          >
            Ver más información
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CursoCard;