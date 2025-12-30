import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface VideoPlayerProps {
  youtubeUrl: string;
  title: string;
  onComplete?: () => void;
  startTime?: number; // Starting position in seconds
  onProgress?: (seconds: number) => void; // Called periodically with current time
}

const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: any }
}

// VideoPlayer component that handles YouTube and direct file URLs
const VideoPlayer = ({ youtubeUrl, title, onComplete, startTime = 0, onProgress }: VideoPlayerProps) => {
  const { t } = useI18n();
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractYoutubeId(youtubeUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    // Small delay to show loading state
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [youtubeUrl]);

  // YouTube Player Effect
  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    // Clear previous player if any
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (err) { console.error(err); }
      playerRef.current = null;
    }

    const ensureApi = () =>
      new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const scriptExists = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!scriptExists) {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(check);
            resolve();
          }
        }, 200);
      });

    (async () => {
      await ensureApi();
      if (!containerRef.current) return; // double check existence

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          rel: 0, // Don't show related videos
          modestbranding: 1, // Hide YouTube logo (mostly)
          playsinline: 1,
          controls: 1, // Show controls (needed for playback)
          iv_load_policy: 3, // Hide annotations
          showinfo: 0, // Hide title/uploader (deprecated but still helps)
          fs: 1, // Allow fullscreen (better UX)
          disablekb: 0, // Allow keyboard controls (better UX)
          cc_load_policy: 0, // Don't force captions
          color: 'white', // Use white progress bar (more neutral)
          enablejsapi: 1, // Enable JS API for better control
          start: Math.floor(startTime) // Start at specific time
        },
        events: {
          onReady: (e: any) => {
            // Seek to start time if specified
            if (startTime && startTime > 0) {
              e.target.seekTo(startTime, true);
            }
          },
          onStateChange: (e: any) => {
            // 0: ended
            if (e?.data === 0 && typeof onComplete === "function") {
              onComplete();
            }
          }
        }
      });
    })();

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (err) { console.error(err); }
        playerRef.current = null;
      }
    };
  }, [videoId, onComplete, startTime]);

  // Track progress periodically for YouTube videos
  useEffect(() => {
    if (!videoId || !playerRef.current || !onProgress) return;

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime && currentTime > 0) {
            onProgress(Math.floor(currentTime));
          }
        } catch (err) {
          console.error('Error getting current time:', err);
        }
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [videoId, onProgress]);

  // If no URL at all
  if (!youtubeUrl) {
    return (
      <div className="aspect-video bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <img
            src="/faitel-logo-novo.png"
            alt="FAITELEAD"
            className="w-32 h-32 object-contain mx-auto opacity-80"
          />
          <p className="text-primary-foreground/80 text-lg font-display">
            {t('video.not_available')}
          </p>
          <p className="text-primary-foreground/60 text-sm max-w-md">
            {t('video.not_configured')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black group flex items-center justify-center overflow-hidden">
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-hero z-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-primary-foreground text-sm">{t('video.loading')}</p>
          </div>
        </div>
      )}

      {/* Logic: If ID exists, generic YouTube player container. Else HTML5 video */}
      {videoId ? (
        <div className="relative w-full h-full">
          <div ref={containerRef} className="w-full h-full" />
          {/* Custom overlay to hide YouTube branding in corners */}
          <div className="absolute top-0 right-0 w-20 h-16 bg-black pointer-events-none z-30" />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={youtubeUrl}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          onTimeUpdate={(e) => {
            if (onProgress) {
              onProgress(Math.floor(e.currentTarget.currentTime));
            }
          }}
          onLoadedMetadata={(e) => {
            if (startTime && startTime > 0) {
              e.currentTarget.currentTime = startTime;
            }
          }}
          onEnded={() => {
            if (onComplete) onComplete();
          }}
        />
      )}

      {/* Gradient Overlay for Title (Only visible on hover and if title exists) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-display font-semibold truncate shadow-sm">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
