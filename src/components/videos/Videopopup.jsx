// Videopopup.jsx
import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material'; 
import YouTube from 'react-youtube';
import YouTubeIcon from '@mui/icons-material/YouTube'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\s&]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : null;
};

const Videopopup = ({ videoUrl, onPlayerReady, isPlaying, onPlayPause, hasStartedPlaying }) => {
  const [isHovering, setIsHovering] = useState(false); 

  if (!videoUrl) return null;

  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;
  
  const youtubeOpts = {
    playerVars: {
      autoplay: 0,
      controls: 0,         
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
    },
  };

  const fillParentStyles = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 0,
  };

  const handleOnReady = (event) => {
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#000',
        borderRadius: 1,
        overflow: 'hidden',
        '& iframe': {
          ...fillParentStyles,
        },
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {youtubeVideoId ? (
        <YouTube
          videoId={youtubeVideoId}
          opts={youtubeOpts}
          className="yt-player"
          style={fillParentStyles}
          onReady={handleOnReady}
        />
      ) : (
        <video
          src={videoUrl}
          style={{ ...fillParentStyles, objectFit: 'contain' }}
          title="Video del curso"
        />
      )}

      <Box
        sx={{
          ...fillParentStyles, 
          zIndex: 1,           
          backgroundColor: 'transparent', 
          cursor: 'pointer',   
          pointerEvents: 'auto', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: (!hasStartedPlaying || !isPlaying || isHovering) ? 1 : 0, 
          transition: 'opacity 0.3s ease-in-out', 
        }}
        onContextMenu={(e) => e.preventDefault()} 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onPlayPause} 
      >
        {isYouTubeVideo && !hasStartedPlaying ? (
          <Box
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              padding: 1, 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: { xs: 80, sm: 100 }, 
              height: { xs: 80, sm: 100 }, 
            }}
          >
            <YouTubeIcon sx={{ fontSize: { xs: 70, sm: 82 }, color: 'white' }} />
          </Box>
        ) : (
          <IconButton 
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
              padding: { xs: '12px', sm: '16px' } 
            }}
            aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
          >
            {isPlaying ? 
              <PauseIcon sx={{ fontSize: { xs: 50, sm: 70 }, color: 'white' }} /> 
              : 
              <PlayArrowIcon sx={{ fontSize: { xs: 50, sm: 70 }, color: 'white' }} />
            }
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default Videopopup;