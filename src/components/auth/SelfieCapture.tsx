import { useState, useRef, useCallback } from "react";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  capturedImage?: string;
}

const SelfieCapture = ({ onCapture, onCancel, capturedImage }: SelfieCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(capturedImage || null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setPreview(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setPreview(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (preview) {
      onCapture(preview);
    }
  }, [preview, onCapture]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 space-y-4">
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {!isStreaming && !preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="h-12 w-12 mb-2" />
              <p className="text-sm">Clique para iniciar a câmera</p>
              {error && <p className="text-destructive text-xs mt-2">{error}</p>}
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isStreaming ? "block" : "hidden"}`}
            style={{ transform: "scaleX(-1)" }}
          />
          
          {preview && (
            <img
              src={preview}
              alt="Selfie preview"
              className="w-full h-full object-cover"
            />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Face guide overlay */}
          {isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-full" />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!isStreaming && !preview && (
            <>
              <Button onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" />
                Iniciar Câmera
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </>
          )}

          {isStreaming && (
            <>
              <Button onClick={capturePhoto} className="gap-2">
                <Camera className="h-4 w-4" />
                Capturar
              </Button>
              <Button variant="outline" onClick={() => { stopCamera(); onCancel(); }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          {preview && (
            <>
              <Button onClick={confirmPhoto} className="gap-2">
                <Check className="h-4 w-4" />
                Confirmar
              </Button>
              <Button variant="outline" onClick={retake} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Tirar Outra
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Posicione seu rosto dentro do círculo para uma foto clara
        </p>
      </CardContent>
    </Card>
  );
};

export default SelfieCapture;
