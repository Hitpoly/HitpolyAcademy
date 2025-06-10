import React from "react";
import { Box } from "@mui/material";

const CourseVideo = ({ videoUrl }) => {
  if (!videoUrl) return <p>No video URL provided.</p>;

  return (
    <Box
      sx={{
        position: "relative",
        paddingTop: "56.25%",
        overflow: "hidden",
        boxShadow: 2,
      }}
    >
      <Box
        component="video"
        src={videoUrl}
        controls
        autoPlay
        muted
        loop
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          console.error("Error loading video:", e);
          alert(
            "Failed to load the video. Please check the URL or try again later."
          );
        }}
      >
        Your browser does not support the video tag or the file format of the
        video.
      </Box>
    </Box>
  );
};

export default CourseVideo;
