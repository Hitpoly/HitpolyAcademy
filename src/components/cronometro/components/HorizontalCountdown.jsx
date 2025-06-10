import React, { useState, useEffect } from "react";
import { Typography, Paper, Stack, useTheme } from "@mui/material";

const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    const totalSeconds = Math.floor(difference / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    timeLeft = {
      days: totalDays,
      hours: totalHours % 24,
      minutes: totalMinutes % 60,
      seconds: totalSeconds % 60,
    };

    if (totalDays === 0) {
      timeLeft.hours = totalHours;
    }
  }
  return timeLeft;
};

const FlipCard = ({ label, value }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={6}
      sx={{
        width: 70,
        height: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 2,
        p: 1,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0px 8px 15px rgba(0,0,0,0.3), 0px 0px 5px ${theme.palette.secondary.main}`,
        animation: "flipEffect 0.5s ease-out",
        "@keyframes flipEffect": {
          "0%": { transform: "rotateX(90deg)", opacity: 0.5 },
          "100%": { transform: "rotateX(0deg)", opacity: 1 },
        },
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          mt: 0.5,
          textTransform: "uppercase",
          opacity: 0.8,
          fontSize: "0.65rem",
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
};

const CountdownTimer = ({ targetDate, onCountdownEnd }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0) {
        clearInterval(timer);
        onCountdownEnd && onCountdownEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onCountdownEnd]);

  if (Object.keys(timeLeft).length === 0) {
    return null;
  }

  const timerComponents = [];

  if (timeLeft.days > 0) {
    timerComponents.push(
      <FlipCard key="days" label="Días" value={timeLeft.days} />
    );
  }

  if (
    timeLeft.hours > 0 ||
    timerComponents.length > 0 ||
    (timeLeft.days === 0 && (timeLeft.minutes > 0 || timeLeft.seconds > 0))
  ) {
    timerComponents.push(
      <FlipCard key="hours" label="Horas" value={timeLeft.hours} />
    );
  }

  if (
    timeLeft.minutes > 0 ||
    timerComponents.length > 0 ||
    timeLeft.seconds > 0
  ) {
    timerComponents.push(
      <FlipCard key="minutes" label="Minutos" value={timeLeft.minutes} />
    );
  }

  timerComponents.push(
    <FlipCard key="seconds" label="Segundos" value={timeLeft.seconds} />
  );

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5, md: 2 }}
      alignItems="center"
      justifyContent="center"
      sx={{
        flexGrow: 1,
        flexWrap: "wrap",
        maxWidth: { xs: "100%", md: "unset" },
      }}
    >
      {timerComponents.map((component, index) => (
        <React.Fragment key={index}>{component}</React.Fragment>
      ))}
    </Stack>
  );
};

export default CountdownTimer;
