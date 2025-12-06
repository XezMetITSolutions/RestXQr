import React, { useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        className="object-cover w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;
