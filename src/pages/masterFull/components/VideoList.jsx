import React from "react";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const VideoLista = ({
  activities,
  onSelectVideo,
  completedVideos,
  toggleCompletedVideo,
  selectedVideoIndex,
}) => {
  const handleChangeVideo = (index) => {
    if (index > selectedVideoIndex) {
      if (!completedVideos.includes(selectedVideoIndex)) {
        toggleCompletedVideo(selectedVideoIndex);
      }
    } else if (index < selectedVideoIndex) {
      if (completedVideos.includes(index)) {
        toggleCompletedVideo(index);
      }
    }

    onSelectVideo(index);
  };

  const handleToggleCompleted = (index, event) => {
    event.stopPropagation();
    toggleCompletedVideo(index);
  };

  return (
    <Box
      sx={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#fafafa",
        maxHeight: "75vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: "20px", color: "#00695C" }}>
        Programa Máster Full
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {activities.map((activity, index) => (
            <ListItem
              key={index}
              sx={{
                cursor: "pointer",
                padding: "10px 15px",
                "&:hover": { backgroundColor: "#80c8db" },
                backgroundColor:
                  selectedVideoIndex === index
                    ? "#6C4DE2"
                    : completedVideos.includes(index)
                    ? "#0B8DB5"
                    : "transparent",
              }}
              onClick={() => handleChangeVideo(index)}
            >
              <ListItemText
                primary={activity.title}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: completedVideos.includes(index)
                    ? "line-through"
                    : "none",
                  color:
                    selectedVideoIndex === index ||
                    completedVideos.includes(index)
                      ? "white"
                      : "#211E26",
                }}
              />
              <Box
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: completedVideos.includes(index) ? "white" : "#211E26",
                }}
                onClick={(e) => handleToggleCompleted(index, e)}
              >
                {completedVideos.includes(index) ? (
                  <CheckCircleIcon />
                ) : (
                  <CheckCircleOutlineIcon />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default VideoLista;
