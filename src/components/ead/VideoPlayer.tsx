import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

interface VideoPlayerProps {
  youtubeUrl: string;
  title: string;
  onComplete?: () => void;
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
const VideoPlayer = ({ youtubeUrl, title, onComplete }: VideoPlayerProps) => {
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
          rel: 0, modestbranding: 1, playsinline: 1
        },
        events: {
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
  }, [videoId, onComplete]);

  // If no URL at all
  if (!youtubeUrl) {
    return (
      <div className="aspect-video bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Play className="w-10 h-10 text-primary-foreground" />
          </div>
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
    <div className="relative aspect-video bg-black group flex items-center justify-center overflow-hidden">
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
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <video
          ref={videoRef}
          src={youtubeUrl}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          onEnded={() => {
            if (onComplete) onComplete();
          }}
        // Auto-play depending on user preference? usually better not to auto-play or muted
        // but for consistency with previous behavior, let's leave it to user
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
