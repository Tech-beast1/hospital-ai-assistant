import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Trash2, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  isLoading?: boolean;
}

export default function VoiceRecorder({ onTranscriptionComplete, isLoading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Unable to access microphone. Please check permissions.");
      console.error("Microphone access error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success("Recording stopped");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error("No audio to transcribe");
      return;
    }

    setIsTranscribing(true);
    try {
      // Convert blob to base64 for API transmission
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result as string;
        
        try {
          // Call the transcription API
          const response = await fetch("/api/trpc/patient.transcribeAudio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              audio: base64Audio,
              mimeType: "audio/webm",
            }),
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          const transcribedText = data.result?.text || "";

          if (transcribedText) {
            onTranscriptionComplete(transcribedText);
            toast.success("Audio transcribed successfully!");
            setAudioBlob(null);
            setRecordingTime(0);
          } else {
            toast.error("Could not transcribe audio. Please try again.");
          }
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error("Transcription failed. Please try again.");
        } finally {
          setIsTranscribing(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Error processing audio");
      setIsTranscribing(false);
    }
  };

  const handlePlayback = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  const handleClear = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  return (
    <Card className="border-orange-500/30 bg-slate-900/50 backdrop-blur p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Voice Symptom Report</h3>
        </div>

        <p className="text-gray-300 text-sm">
          Record your symptoms instead of typing. Perfect when you're not feeling well.
        </p>

        {/* Recording Controls */}
        <div className="flex gap-3 flex-wrap">
          {!isRecording && !audioBlob ? (
            <Button
              onClick={startRecording}
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : isRecording ? (
            <>
              <Button
                onClick={stopRecording}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
              <div className="text-orange-300 font-mono text-sm flex items-center">
                {formatTime(recordingTime)}
              </div>
            </>
          ) : null}
        </div>

        {/* Audio Playback */}
        {audioBlob && (
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-lg p-4 space-y-3">
            <p className="text-gray-300 text-sm font-semibold">Recording ready for transcription</p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handlePlayback}
                variant="outline"
                className="gap-2 border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
              >
                <Play className="h-4 w-4" />
                Play Back
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                className="gap-2 border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>

              <Button
                onClick={handleTranscribe}
                disabled={isTranscribing || isLoading}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 flex-1"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Transcribe & Fill Form
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" />

        {/* Info */}
        <p className="text-xs text-gray-400 mt-4">
          💡 Tip: Speak clearly about your symptoms, medical history, allergies, and current medications. The AI will transcribe and analyze your report.
        </p>
      </div>
    </Card>
  );
}
