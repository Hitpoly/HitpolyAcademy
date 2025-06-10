import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";

const CursoCard = ({ title, subtitle, banner, accessLink }) => {
  return (
    <Card
      sx={{
        width: 300,
        minWidth: 250,
        maxWidth: 300,
        height: 400,
        maxHeight: 400,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease-in-out",
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      {banner && (
        <CardMedia
          component="img"
          height="140"
          image={banner}
          alt={title}
          sx={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingBottom: "0 !important", 
        }}
      >
        <Box>
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
              mb: 1,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2, 
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.5,
                height: "3em", 
                color: "text.secondary",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            pt: 2,
            pb: 2, 
            pl: 2, 
            pr: 2, 
          }}
        >
          <Button
            size="small"
            variant="contained" 
            sx={{
              backgroundColor: "#F21C63",
              color: "#ffff",
              padding: "8px 24px",
              borderRadius: "8px",
              textTransform: "uppercase", 
              fontWeight: "bold",
              '&:hover': {
                backgroundColor: "#d91a5a",
              },
            }}
            href={accessLink}
          >
            Acceder
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CursoCard;