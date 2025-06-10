import React from "react";
import { Box, Typography, Avatar, Divider } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";



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
  const infoBlocks = [
    {
      icon: AccessTimeIcon,
      title: duration,
      subtitle: hoursPerWeek,
    },
    {
      icon: CalendarTodayIcon,
      title: startDate,
      subtitle: enrollmentDeadline,
    },
    {
      icon: PersonIcon,
      title: learningPace,
      subtitle: classType,
    },
    {
      icon: EmojiEventsIcon,
      title: credentialTitle,
      subtitle: credentialDescription,
    },
  ];

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
        {infoBlocks.map((block, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
          >
            <block.icon
              sx={{ color: "#007bff", fontSize: { xs: 24, md: 28 } }}
            />
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", md: "1.05rem" } }}
              >
                {block.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.85rem", md: "0.9rem" } }}
              >
                {block.subtitle}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          pt: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          textAlign: { xs: "center", sm: "left" },
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{ color: "#333", fontSize: { xs: "0.9rem", md: "0.95rem" } }}
        >
          {brandingData.logoText}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
        >
          {brandingData.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProgrammeDetailsBanner;