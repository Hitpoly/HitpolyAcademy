import React from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'; 
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; 
import EventBusyIcon from '@mui/icons-material/EventBusy'; 
import PsychologyIcon from '@mui/icons-material/Psychology'; 
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook'; 
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; 
import DescriptionIcon from '@mui/icons-material/Description'; 

const ProgrammeDetailsBanner = ({
  programmeName,
  description,
  duration,
  hoursPerWeek,
  startDate,
  enrollmentDeadline,
  learningPace,
  classType,
  credentialTitle,
  credentialDescription,
  instructorData,
  brandingData, 
}) => {
  const mainInfoItems = [
    { label: "Duración", value: duration, icon: AccessTimeIcon },
    { label: "Horas por semana", value: hoursPerWeek, icon: QueryBuilderIcon },
    { label: "Inicio de clases", value: startDate, icon: CalendarTodayIcon },
    { label: "Fecha límite de inscripción", value: enrollmentDeadline, icon: EventBusyIcon, iconColor: "error.main" },
    { label: "Ritmo de aprendizaje", value: learningPace, icon: PsychologyIcon },
    { label: "Tipo de clase", value: classType, icon: LaptopChromebookIcon },
  ];


  const credentialInfoItems = [
    { label: "Credencial", value: credentialTitle, icon: EmojiEventsIcon },
    { label: "Descripción de credencial", value: credentialDescription, hideLabel: true, hideIcon: true },
  ];

  const renderInfoItem = (item, index) => (
    (item.value || item.value === 0) && (
      <Box
        key={index}
        sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
      >
        {item.icon && !item.hideIcon ? (
          <item.icon
            sx={{ color: item.iconColor || "#007bff", fontSize: { xs: 24, md: 28 }, mt: 0.5 }}
          />
        ) : (
          !item.hideLabel && <Box sx={{ width: { xs: 24, md: 28 }, height: { xs: 24, md: 28 }, flexShrink: 0 }} />
        )}
        <Box>
          {!item.hideLabel && (
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1rem", md: "1.05rem" }, lineHeight: 1.2 }}
            >
              {item.label}:
            </Typography>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.85rem", md: "0.9rem" } }}
          >
            {item.value}
          </Typography>
        </Box>
      </Box>
    )
  );

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        padding: { xs: 3, md: 4 },
        margin: "0 auto",
        fontFamily: "sans-serif",
        borderRadius: "25px",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{
          color: "#212121",
          mb: 1.5,
          fontSize: { xs: "1.4rem", sm: "1.6rem" },
        }}
      >
        {programmeName}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{
          mb: 3,
          fontSize: { xs: "0.95rem", sm: "1rem" },
        }}
      >
        {description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Avatar
          alt={instructorData.name}
          src={instructorData.avatar}
          sx={{ width: 80, height: 80, flexShrink: 0 }}
        />
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 0.5,
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
            }}
          >
            Instructor:
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#212121", fontSize: { xs: "1rem", sm: "1.05rem" } }}
          >
            {instructorData.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
          >
            {instructorData.description}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, 
          gap: { xs: 2.5, md: 3 },
          mb: 4,
          pt: 3,
        }}
      >
        {mainInfoItems.map(renderInfoItem)}

        {(credentialTitle || credentialDescription) && ( 
          <Box
            sx={{
              gridColumn: { xs: "1 / -1", sm: "2 / 3" }, 
              display: "flex",
              flexDirection: "column", 
              gap: { xs: 2.5, md: 3 }, 
            }}
          >
            {credentialInfoItems.map(renderInfoItem)}
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          pt: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: 'wrap',
          flexDirection: { xs: "column", sm: "row" },
          textAlign: { xs: "center", sm: "left" },
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        {brandingData && brandingData.length > 0 ? (
          <>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ width: '100%', textAlign: { xs: "center", sm: "left" }, mb: 1 }}
            >
              Marcas Asociadas:
            </Typography>
            {brandingData.map((brand, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ color: "#333", fontSize: { xs: "0.9rem", md: "0.95rem" } }}
                >
                  {brand.logoText}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
                >
                  {brand.description}
                </Typography>
              </Box>
            ))}
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No hay marcas asociadas para mostrar.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgrammeDetailsBanner;