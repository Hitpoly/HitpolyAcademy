import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import YouTubeIcon from '@mui/icons-material/YouTube';

import Videopopup from "./Videopopup"; 

const VideoPlayerWithControls = ({ videoUrl, onVideoCompleted }) => {
  const [player, setPlayer] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPaused, setIsPaused] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [isYouTubePlayer, setIsYouTubePlayer] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerContainerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const YT_PLAYING = 1;
  const YT_PAUSED = 2;
  const YT_ENDED = 0;
  const YT_BUFFERING = 3;

  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval();
    const id = setInterval(() => {
      if (isYouTube) {
        if (playerInstance && typeof playerInstance.getCurrentTime === 'function' && typeof playerInstance.getDuration === 'function') {
          const currentT = playerInstance.getCurrentTime();
          const dur = playerInstance.getDuration();
          if (dur > 0 && currentT !== null && currentT !== undefined) {
            setCurrentTime(currentT);
            setVideoProgress((currentT / dur) * 100);

            if (currentT >= dur - 0.5 && dur > 0 && player?.getPlayerState() !== YT_ENDED) {
              setIsPaused(true);
              setVideoProgress(100);
              setCurrentTime(duration);
              stopProgressInterval();
              onVideoCompleted();
            }
          }
        }
      } else {
        if (playerInstance && playerInstance.currentTime !== null && playerInstance.duration !== null && playerInstance.duration > 0) {
          setCurrentTime(playerInstance.currentTime);
          setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
        }
      }
    }, 1000);
    setIntervalId(id);
  }, [duration, onVideoCompleted, player]);

  const stopProgressInterval = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const handleYouTubeStateChange = useCallback((state) => {
    if (!player) return;

    switch (state) {
      case YT_PLAYING:
        setIsPaused(false);
        setHasStartedPlaying(true);
        startProgressInterval(player, true);
        if (player.getDuration() > 0) {
          setDuration(player.getDuration());
        }
        break;
      case YT_PAUSED:
        setIsPaused(true);
        stopProgressInterval();
        break;
      case YT_ENDED:
        setIsPaused(true);
        setVideoProgress(100);
        setCurrentTime(duration);
        stopProgressInterval();
        onVideoCompleted();
        break;
      case YT_BUFFERING:
        break;
      default:
        break;
    }
  }, [player, startProgressInterval, stopProgressInterval, onVideoCompleted, duration]);


  const handlePlayerReady = useCallback((playerInstance) => {
    setPlayer(playerInstance);
    setIsYouTubePlayer(typeof playerInstance.playVideo === 'function');

    if (typeof playerInstance.playVideo === 'function') {
      const checkDurationYT = setInterval(() => {
        if (playerInstance.getDuration && playerInstance.getDuration() > 0) {
          setDuration(playerInstance.getDuration());
          clearInterval(checkDurationYT);
        }
      }, 100);

    } else {
      playerInstance.volume = volume / 100;

      playerInstance.onplay = () => {
        setIsPaused(false);
        setHasStartedPlaying(true);
        startProgressInterval(playerInstance, false);
      };
      playerInstance.onpause = () => {
        setIsPaused(true);
        stopProgressInterval();
      };
      playerInstance.onended = () => {
        setIsPaused(true);
        setVideoProgress(100);
        setCurrentTime(duration);
        stopProgressInterval();
        onVideoCompleted();
      };
      playerInstance.ontimeupdate = () => {
        if (playerInstance.duration > 0) {
          setCurrentTime(playerInstance.currentTime);
          setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
        }
      };
      playerInstance.ondurationchange = () => {
        setDuration(playerInstance.duration);
      };
      playerInstance.onvolumechange = () => {
        setVolume(playerInstance.volume * 100);
      };
      if (playerInstance.readyState >= 1) {
        setDuration(playerInstance.duration);
      }
    }
  }, [volume, onVideoCompleted, duration, startProgressInterval, stopProgressInterval]);


  useEffect(() => {
    return () => {
      stopProgressInterval();
    };
  }, [stopProgressInterval]);

  useEffect(() => {
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPaused(true);
    setHasStartedPlaying(false);
    setDuration(0);
    setPlayer(null);
  }, [videoUrl]);


  const handlePlayPause = () => {
    if (player) {
      if (isYouTubePlayer) {
        if (isPaused) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } else {
        if (isPaused) {
          player.play();
        } else {
          player.pause();
        }
      }
    }
  };

  const handleSeek = (event, newValue) => {
    setVideoProgress(newValue);
  };

  const handleSeekCommitted = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        if (player.getDuration) {
          const dur = player.getDuration();
          if (dur > 0) {
            const timeToSeek = (newValue / 100) * dur;
            player.seekTo(timeToSeek, true);
            setCurrentTime(timeToSeek);
            if (!isPaused) {
                startProgressInterval(player, true);
            }
          }
        }
      } else {
        if (player.duration > 0) {
          const timeToSeek = (newValue / 100) * player.duration;
          player.currentTime = timeToSeek;
          setCurrentTime(timeToSeek);
          if (!isPaused) {
            startProgressInterval(player, false);
          }
        }
      }
    }
  };


  const handleVolumeChange = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        player.setVolume(newValue);
      } else {
        player.volume = newValue / 100;
      }
      setVolume(newValue);
    }
  };

  const handleMuteToggle = () => {
    if (player) {
      if (isYouTubePlayer) {
        if (player.isMuted()) {
          player.unMute();
          player.setVolume(50);
          setVolume(50);
        } else {
          player.mute();
          setVolume(0);
        }
      } else {
        if (player.volume === 0) {
          player.volume = 0.5;
          setVolume(50);
        } else {
          player.volume = 0;
          setVolume(0);
        }
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleFullscreenToggle = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };

  const showControls = !hasStartedPlaying || isPaused || isHovering;

  return (
    <Box ref={playerContainerRef} sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
      <Videopopup
        videoUrl={videoUrl}
        onPlayerReady={handlePlayerReady}
        onYouTubeStateChange={handleYouTubeStateChange}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: showControls ? 1 : 0, 
          transition: 'opacity 0.3s ease-in-out',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={(e) => {
          if (!e.target.closest('.bottom-controls-bar')) {
            handlePlayPause();
          }
        }}
      >
        {player && isPaused ? ( 
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
            {isYouTubePlayer ? ( 
              <YouTubeIcon sx={{ fontSize: { xs: 70, sm: 82 }, color: 'white' }} />
            ) : ( 
              <PlayArrowIcon sx={{ fontSize: { xs: 50, sm: 70 }, color: 'white' }} />
            )}
          </Box>
        ) : null}
      </Box>
         {player && (
        <Box
          className="bottom-controls-bar"
          sx={{
            position: 'absolute',
            height: {xs: "50px", md: "70px"},
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 2 },
            color: 'white',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton onClick={handlePlayPause} color="inherit" size="large">
            {isPaused ? <PlayArrowIcon sx={{ fontSize: {xs: 30, md: 40} }} /> : <PauseIcon sx={{ fontSize: {xs: 30, md: 40} }} />}
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '45px', textAlign: 'center' }}>
            {formatTime(currentTime)}
          </Typography>
          <Box sx={{ flexGrow: 1, maxWidth: { xs: 'calc(100% - 150px)', sm: '60%' } }}>
            <Slider
              value={videoProgress}
              onChange={handleSeek}
              onChangeCommitted={handleSeekCommitted}
              aria-labelledby="video-progress-slider"
              size="small"
              color="primary"
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  color: 'white',
                },
                '& .MuiSlider-track': {
                  color: 'primary.light',
                },
                '& .MuiSlider-rail': {
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ minWidth: '45px', textAlign: 'center' }}>
            {formatTime(duration)}
          </Typography>

          <IconButton onClick={handleMuteToggle} color="inherit" size="small">
            {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            orientation="horizontal"
            sx={{
              width: { xs: 80, sm: 100 },
              '& .MuiSlider-thumb': {
                color: 'white',
              },
              '& .MuiSlider-track': {
                color: 'primary.light',
              },
              '& .MuiSlider-rail': {
                color: 'rgba(255,255,255,0.3)',
              },
            }}
            size="small"
            color="primary"
          />
          <IconButton onClick={handleFullscreenToggle} color="inherit" size="small">
            {document.fullscreenElement ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayerWithControls;