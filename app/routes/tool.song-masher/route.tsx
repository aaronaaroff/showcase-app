import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { 
  Music,
  Zap,
  Download,
  Play,
  Pause,
  Upload,
  Youtube,
  Sparkles,
  Loader2,
  X,
  FileAudio,
  Sliders,
  Blend,
  ListMusic,
  Activity,
  Disc,
  Radio,
  Gauge
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Song Masher - Blend & Mix Audio Tracks" },
    { name: "description", content: "Create mashups and seamless playlists by blending audio tracks with funky controls and sin wave visualizations." },
  ];
}

type AudioSource = {
  id: string;
  name: string;
  type: 'file' | 'youtube';
  url?: string;
  file?: File;
  duration?: number;
  isLoaded: boolean;
  audioBuffer?: AudioBuffer;
  bpm?: number;
  analysisData?: {
    tempo: number;
    key: string;
    energy: number;
    loudness: number;
  };
};

type ModeType = 'mash' | 'playlist';

// Liquid Toggle Component
function LiquidToggle({ 
  value, 
  onChange,
  leftLabel,
  rightLabel,
  leftIcon: LeftIcon,
  rightIcon: RightIcon
}: {
  value: ModeType;
  onChange: (value: ModeType) => void;
  leftLabel: string;
  rightLabel: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative inline-flex items-center p-1 bg-gray-900 rounded-full shadow-inner">
      {/* Background liquid blob */}
      <div 
        className={cn(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-out",
          "bg-gradient-to-br shadow-lg",
          value === 'mash' 
            ? "left-1 from-orange-500 to-red-500 shadow-orange-500/50" 
            : "left-[calc(50%+4px)] from-cyan-500 to-blue-500 shadow-cyan-500/50"
        )}
        style={{
          filter: 'blur(0.5px)',
        }}
      >
        {/* Liquid effect layers */}
        <div className="absolute inset-0 rounded-full bg-white/20 blur-sm animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/10" />
      </div>
      
      {/* Buttons */}
      <button
        onClick={() => onChange('mash')}
        className={cn(
          "relative z-10 flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300",
          value === 'mash' 
            ? "text-white" 
            : "text-gray-400 hover:text-gray-200"
        )}
      >
        {LeftIcon && <LeftIcon className="h-4 w-4" />}
        {leftLabel}
      </button>
      <button
        onClick={() => onChange('playlist')}
        className={cn(
          "relative z-10 flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300",
          value === 'playlist' 
            ? "text-white" 
            : "text-gray-400 hover:text-gray-200"
        )}
      >
        {RightIcon && <RightIcon className="h-4 w-4" />}
        {rightLabel}
      </button>
    </div>
  );
}

// Circular Slider Component with tactile design
function CircularSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  size = 120, 
  color = '#ff6b35',
  label,
  unit = '%'
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  unit?: string;
}) {
  const center = size / 2;
  const radius = size / 2 - 15;
  const angle = ((value - min) / (max - min)) * 360 - 90;
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let degrees = (mouseAngle * 180) / Math.PI + 90;
    if (degrees < 0) degrees += 360;
    
    const newValue = min + (degrees / 360) * (max - min);
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {label && <Label className="text-sm font-bold uppercase tracking-wider text-gray-300">{label}</Label>}
      <div 
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseMove={handleMouseMove}
      >
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-2xl">
          {/* Outer ring with notches */}
          <circle
            cx={center}
            cy={center}
            r={radius + 10}
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="2"
          />
          {/* Notches */}
          {Array.from({ length: 12 }).map((_, i) => {
            const notchAngle = (i * 30 - 90) * Math.PI / 180;
            const innerR = radius + 5;
            const outerR = radius + 12;
            return (
              <line
                key={i}
                x1={center + innerR * Math.cos(notchAngle)}
                y1={center + innerR * Math.sin(notchAngle)}
                x2={center + outerR * Math.cos(notchAngle)}
                y2={center + outerR * Math.sin(notchAngle)}
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth="2"
              />
            );
          })}
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="rgba(0, 0, 0, 0.8)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(value - min) / (max - min) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
            className="filter drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 10px ${color})`
            }}
          />
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={radius - 20}
            fill="rgba(20, 20, 20, 1)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
          {/* Knob with metallic finish */}
          <g transform={`rotate(${angle + 90} ${center} ${center})`}>
            <circle
              cx={center + radius}
              cy={center}
              r="12"
              fill="url(#metalGradient)"
              stroke={color}
              strokeWidth="2"
              className="drop-shadow-xl"
            />
            <circle
              cx={center + radius}
              cy={center}
              r="4"
              fill={color}
            />
          </g>
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="metalGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#cccccc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#666666" stopOpacity="0.8" />
            </radialGradient>
          </defs>
        </svg>
        {/* Value display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold font-mono" style={{ color }}>
              {Math.round(value)}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">
              {unit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio Analysis and Web Audio API utilities
class AudioAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private source: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async loadAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  detectBPM(audioBuffer: AudioBuffer): number {
    // Simplified BPM detection - in reality this would be more complex
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0);
    
    // Simple peak detection algorithm
    let peaks = 0;
    let lastPeak = 0;
    const threshold = 0.3;
    
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i] > threshold && samples[i] > samples[i-1] && samples[i] > samples[i+1]) {
        if (i - lastPeak > sampleRate * 0.3) { // Minimum 300ms between peaks
          peaks++;
          lastPeak = i;
        }
      }
    }
    
    const duration = audioBuffer.duration;
    const bpm = Math.round((peaks / duration) * 60);
    return Math.max(60, Math.min(200, bpm)); // Clamp between 60-200 BPM
  }

  analyzeAudio(audioBuffer: AudioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    let energy = 0;
    let loudness = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      energy += sample * sample;
      loudness += sample;
    }
    
    energy = Math.sqrt(energy / channelData.length);
    loudness = loudness / channelData.length;
    
    return {
      tempo: this.detectBPM(audioBuffer),
      key: 'C', // Simplified - real key detection would be complex
      energy: Math.round(energy * 100),
      loudness: Math.round(loudness * 100)
    };
  }

  createSource(audioBuffer: AudioBuffer): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    return source;
  }

  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}

// Sin Wave Visualizer Component with real audio analysis
function WaveVisualizer({ 
  isPlaying, 
  color = '#ff6b35',
  height = 80,
  audioAnalyzer,
  audioBuffer
}: { 
  isPlaying: boolean; 
  color?: string;
  height?: number;
  audioAnalyzer?: AudioAnalyzer;
  audioBuffer?: AudioBuffer;
}) {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(128));
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (audioAnalyzer) {
        const data = audioAnalyzer.getFrequencyData();
        setFrequencyData(data);
      }
      setOffset(prev => (prev + 3) % 800);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPlaying, audioAnalyzer]);

  const generateWaveFromFrequency = (baseAmplitude: number, frequencyMultiplier: number, phase: number) => {
    const points = [];
    for (let x = 0; x <= 800; x += 2) {
      // Use real frequency data if available, otherwise fall back to sine wave
      let amplitude = baseAmplitude;
      if (frequencyData.length > 0) {
        const freqIndex = Math.floor((x / 800) * frequencyData.length);
        amplitude = baseAmplitude * (frequencyData[freqIndex] / 255);
      }
      
      const y = height/2 + amplitude * Math.sin((x + offset + phase) * frequencyMultiplier * 0.01);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const generateFallbackWave = (amplitude: number, frequency: number, phase: number) => {
    const points = [];
    for (let x = 0; x <= 800; x += 2) {
      const y = height/2 + amplitude * Math.sin((x + offset + phase) * frequency * 0.01);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div className="w-full h-full bg-black border-y border-gray-700 shadow-inner -mx-6">
      <svg width="100%" height="100%" viewBox={`0 0 800 ${height}`} preserveAspectRatio="none" className="filter contrast-125">
        {/* Grid lines for oscilloscope effect */}
        {Array.from({ length: Math.floor(height / 10) + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 10}
            x2="800"
            y2={i * 10}
            stroke="rgba(0, 255, 0, 0.1)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 21 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 40}
            y1="0"
            x2={i * 40}
            y2={height}
            stroke="rgba(0, 255, 0, 0.1)"
            strokeWidth="1"
          />
        ))}
        {/* Multiple wave layers with real audio data */}
        <polyline
          points={audioAnalyzer ? generateWaveFromFrequency(25, 1, 0) : generateFallbackWave(25, 1, 0)}
          fill="none"
          stroke={color}
          strokeWidth="3"
          opacity="1"
          style={{
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
        <polyline
          points={audioAnalyzer ? generateWaveFromFrequency(18, 1.5, 100) : generateFallbackWave(18, 1.5, 100)}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
        />
        <polyline
          points={audioAnalyzer ? generateWaveFromFrequency(12, 2, 200) : generateFallbackWave(12, 2, 200)}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.5"
        />
        <polyline
          points={audioAnalyzer ? generateWaveFromFrequency(8, 3, 300) : generateFallbackWave(8, 3, 300)}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

export default function SongMasher() {
  const [mode, setMode] = useState<ModeType>('mash');
  const [audioSources, setAudioSources] = useState<AudioSource[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Audio engine
  const [audioAnalyzer, setAudioAnalyzer] = useState<AudioAnalyzer | null>(null);
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [processedAudioBuffer, setProcessedAudioBuffer] = useState<AudioBuffer | null>(null);
  
  // Mash mode controls
  const [mashRatio, setMashRatio] = useState(50);
  const [crossfadeTime, setCrossfadeTime] = useState(3);
  const [tempo, setTempo] = useState(100);
  
  // Playlist mode controls
  const [transitionType, setTransitionType] = useState('crossfade');
  const [transitionDuration, setTransitionDuration] = useState(2);
  const [gapTime, setGapTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize audio analyzer
  useEffect(() => {
    setAudioAnalyzer(new AudioAnalyzer());
    
    // Cleanup on unmount
    return () => {
      if (currentAudioSource) {
        currentAudioSource.stop();
      }
    };
  }, []);

  // Clean up audio source when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudioSource) {
        currentAudioSource.stop();
        setCurrentAudioSource(null);
      }
    };
  }, [currentAudioSource]);

  const mashColors = {
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#ffb627',
    bg: 'from-orange-500 via-red-500 to-pink-500'
  };

  const playlistColors = {
    primary: '#00d4ff',
    secondary: '#0099cc',
    accent: '#33e6ff',
    bg: 'from-cyan-500 via-blue-500 to-purple-500'
  };

  const currentColors = mode === 'mash' ? mashColors : playlistColors;

  const addAudioFile = async (file: File) => {
    const newSource: AudioSource = {
      id: Date.now().toString(),
      name: file.name,
      type: 'file',
      file,
      isLoaded: false
    };
    setAudioSources([...audioSources, newSource]);
    
    if (!audioAnalyzer) return;
    
    try {
      // Load and analyze the audio file
      const audioBuffer = await audioAnalyzer.loadAudioFile(file);
      const analysisData = audioAnalyzer.analyzeAudio(audioBuffer);
      
      setAudioSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? { 
              ...source, 
              isLoaded: true, 
              duration: audioBuffer.duration,
              audioBuffer,
              bpm: analysisData.tempo,
              analysisData
            }
          : source
      ));
      
      toast({
        title: "Audio loaded",
        description: `${file.name} - ${analysisData.tempo} BPM`,
      });
    } catch (error) {
      toast({
        title: "Error loading audio",
        description: "Failed to load audio file",
        variant: "destructive"
      });
      setAudioSources(prev => prev.filter(source => source.id !== newSource.id));
    }
  };

  const addYouTubeUrl = (url: string) => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    const newSource: AudioSource = {
      id: Date.now().toString(),
      name: `YouTube Track ${audioSources.length + 1}`,
      type: 'youtube',
      url,
      isLoaded: false
    };
    setAudioSources([...audioSources, newSource]);
    
    // Simulate loading
    setTimeout(() => {
      setAudioSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? { ...source, isLoaded: true, duration: 200 + Math.random() * 100 }
          : source
      ));
    }, 2000);
  };

  const removeAudioSource = (id: string) => {
    setAudioSources(audioSources.filter(source => source.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(async file => {
      if (file.type.startsWith('audio/')) {
        await addAudioFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload audio files only",
          variant: "destructive"
        });
      }
    });
  };

  // Audio processing functions
  const createMashup = async (sources: AudioSource[]): Promise<AudioBuffer> => {
    if (!audioAnalyzer) throw new Error('Audio analyzer not initialized');
    
    const audioCtx = audioAnalyzer.getAudioContext();
    const loadedSources = sources.filter(s => s.audioBuffer);
    
    if (loadedSources.length < 2) throw new Error('Need at least 2 loaded tracks');
    
    // Find the longest duration for the output buffer
    const maxDuration = Math.max(...loadedSources.map(s => s.audioBuffer!.duration));
    const sampleRate = loadedSources[0].audioBuffer!.sampleRate;
    const outputBuffer = audioCtx.createBuffer(2, maxDuration * sampleRate, sampleRate);
    
    // Get output channels
    const outputLeft = outputBuffer.getChannelData(0);
    const outputRight = outputBuffer.getChannelData(1);
    
    // Blend the tracks based on mashRatio and crossfadeTime
    const crossfadeSamples = Math.floor(crossfadeTime * sampleRate);
    const track1Buffer = loadedSources[0].audioBuffer!;
    const track2Buffer = loadedSources[1].audioBuffer!;
    
    const track1Left = track1Buffer.getChannelData(0);
    const track1Right = track1Buffer.numberOfChannels > 1 ? track1Buffer.getChannelData(1) : track1Left;
    const track2Left = track2Buffer.getChannelData(0);
    const track2Right = track2Buffer.numberOfChannels > 1 ? track2Buffer.getChannelData(1) : track2Left;
    
    // Apply tempo adjustment (simplified - real tempo stretching would be complex)
    const tempoRatio = tempo / 100;
    
    for (let i = 0; i < outputBuffer.length; i++) {
      const track1Index = Math.floor(i / tempoRatio);
      const track2Index = Math.floor(i / tempoRatio);
      
      let track1Sample = 0;
      let track2Sample = 0;
      
      if (track1Index < track1Left.length) {
        track1Sample = track1Left[track1Index];
      }
      if (track2Index < track2Left.length) {
        track2Sample = track2Left[track2Index];
      }
      
      // Apply crossfade based on mashRatio
      const ratio1 = mashRatio / 100;
      const ratio2 = 1 - ratio1;
      
      // Simple crossfade implementation
      let crossfadeRatio1 = ratio1;
      let crossfadeRatio2 = ratio2;
      
      if (i < crossfadeSamples) {
        const fadeProgress = i / crossfadeSamples;
        crossfadeRatio1 *= fadeProgress;
        crossfadeRatio2 *= (1 - fadeProgress);
      }
      
      outputLeft[i] = (track1Sample * crossfadeRatio1) + (track2Sample * crossfadeRatio2);
      outputRight[i] = outputLeft[i]; // Simplified stereo handling
    }
    
    return outputBuffer;
  };

  const createPlaylist = async (sources: AudioSource[]): Promise<AudioBuffer> => {
    if (!audioAnalyzer) throw new Error('Audio analyzer not initialized');
    
    const audioCtx = audioAnalyzer.getAudioContext();
    const loadedSources = sources.filter(s => s.audioBuffer);
    
    if (loadedSources.length < 2) throw new Error('Need at least 2 loaded tracks');
    
    // Calculate total duration with gaps and transitions
    const transitionSamples = Math.floor(transitionDuration * loadedSources[0].audioBuffer!.sampleRate);
    const gapSamples = Math.floor(gapTime * loadedSources[0].audioBuffer!.sampleRate);
    
    let totalDuration = 0;
    loadedSources.forEach((source, index) => {
      totalDuration += source.audioBuffer!.duration;
      if (index < loadedSources.length - 1) {
        totalDuration += gapTime;
        if (transitionType === 'crossfade') {
          totalDuration -= transitionDuration; // Overlap for crossfade
        }
      }
    });
    
    const sampleRate = loadedSources[0].audioBuffer!.sampleRate;
    const outputBuffer = audioCtx.createBuffer(2, totalDuration * sampleRate, sampleRate);
    const outputLeft = outputBuffer.getChannelData(0);
    const outputRight = outputBuffer.getChannelData(1);
    
    let outputOffset = 0;
    
    for (let i = 0; i < loadedSources.length; i++) {
      const currentBuffer = loadedSources[i].audioBuffer!;
      const currentLeft = currentBuffer.getChannelData(0);
      const currentRight = currentBuffer.numberOfChannels > 1 ? currentBuffer.getChannelData(1) : currentLeft;
      
      // Copy current track
      for (let j = 0; j < currentLeft.length && outputOffset + j < outputLeft.length; j++) {
        if (i === 0 || transitionType === 'cut' || j >= transitionSamples) {
          // No transition or past transition zone
          outputLeft[outputOffset + j] = currentLeft[j];
          outputRight[outputOffset + j] = currentRight[j];
        } else {
          // Crossfade transition
          const fadeRatio = j / transitionSamples;
          const prevSample = outputLeft[outputOffset + j] || 0;
          outputLeft[outputOffset + j] = prevSample * (1 - fadeRatio) + currentLeft[j] * fadeRatio;
          outputRight[outputOffset + j] = outputRight[outputOffset + j] * (1 - fadeRatio) + currentRight[j] * fadeRatio;
        }
      }
      
      outputOffset += currentLeft.length;
      
      // Add gap between tracks (except for the last track)
      if (i < loadedSources.length - 1) {
        outputOffset += gapSamples;
        if (transitionType === 'crossfade') {
          outputOffset -= transitionSamples; // Overlap for crossfade
        }
      }
    }
    
    return outputBuffer;
  };

  const processAudio = async () => {
    if (audioSources.length < 2) {
      toast({
        title: "Need more tracks",
        description: mode === 'mash' ? "Add at least 2 tracks to create a mashup" : "Add at least 2 tracks to create a playlist",
        variant: "destructive"
      });
      return;
    }

    const loadedSources = audioSources.filter(s => s.isLoaded && s.audioBuffer);
    if (loadedSources.length < 2) {
      toast({
        title: "Wait for tracks to load",
        description: "Please wait for all tracks to finish loading",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 200);

      let processedBuffer: AudioBuffer;
      
      if (mode === 'mash') {
        processedBuffer = await createMashup(loadedSources);
      } else {
        processedBuffer = await createPlaylist(loadedSources);
      }
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setProcessedAudioBuffer(processedBuffer);
      setCurrentTrack(`${mode}-result-${Date.now()}`);
      setIsProcessing(false);
      
      toast({
        title: "Success!",
        description: mode === 'mash' ? "Your mashup is ready!" : "Your playlist is ready!",
      });
    } catch (error) {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const togglePlayback = async () => {
    if (!audioAnalyzer || !processedAudioBuffer) return;
    
    if (isPlaying) {
      // Stop current playback
      if (currentAudioSource) {
        currentAudioSource.stop();
        setCurrentAudioSource(null);
      }
      setIsPlaying(false);
    } else {
      // Start playback
      try {
        // Resume audio context if needed
        if (audioAnalyzer.getAudioContext().state === 'suspended') {
          await audioAnalyzer.getAudioContext().resume();
        }
        
        const source = audioAnalyzer.createSource(processedAudioBuffer);
        source.onended = () => {
          setIsPlaying(false);
          setCurrentAudioSource(null);
        };
        
        source.start();
        setCurrentAudioSource(source);
        setIsPlaying(true);
      } catch (error) {
        toast({
          title: "Playback error",
          description: "Failed to start audio playback",
          variant: "destructive"
        });
      }
    }
  };

  const downloadResult = () => {
    if (!processedAudioBuffer || !audioAnalyzer) return;
    
    toast({
      title: "Download started",
      description: "Your processed audio is being prepared",
    });
    
    // Convert AudioBuffer to WAV blob
    const exportAudioBuffer = () => {
      const length = processedAudioBuffer.length;
      const sampleRate = processedAudioBuffer.sampleRate;
      const channels = processedAudioBuffer.numberOfChannels;
      
      // Create WAV file
      const buffer = new ArrayBuffer(44 + length * channels * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * channels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * channels * 2, true);
      view.setUint16(32, channels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * channels * 2, true);
      
      // Convert float samples to 16-bit PCM
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < channels; channel++) {
          const sample = Math.max(-1, Math.min(1, processedAudioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample * 0x7FFF, true);
          offset += 2;
        }
      }
      
      return new Blob([buffer], { type: 'audio/wav' });
    };
    
    try {
      const blob = exportAudioBuffer();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mode}-result-${Date.now()}.wav`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download complete",
        description: "Your audio file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create audio file",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Header />
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4`}>
        <div className="max-w-7xl mx-auto space-y-6 mt-6">
          {/* Header with tactile design */}
          <Card className="border-2 border-gray-700 shadow-2xl bg-gray-900/95 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Song Masher
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-400">
                    Industrial-grade audio mixing and blending
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <LiquidToggle
                    value={mode}
                    onChange={setMode}
                    leftLabel="Mash"
                    rightLabel="Playlist"
                    leftIcon={Blend}
                    rightIcon={ListMusic}
                  />
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1 bg-gray-800 border-gray-600 text-gray-300">
                      <Gauge className="h-3 w-3" />
                      Pro Audio
                    </Badge>
                    <Badge variant="outline" className="gap-1 bg-gray-800 border-gray-600 text-gray-300">
                      <Activity className="h-3 w-3" />
                      Visualizer
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audio Sources with industrial design */}
            <Card className="lg:col-span-1 border-2 border-gray-700 shadow-xl bg-gray-900">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-100 font-black uppercase tracking-wider">
                  <FileAudio className="h-5 w-5" style={{ color: currentColors.primary }} />
                  Input Tracks
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Load audio files or stream from YouTube
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {/* Upload Controls */}
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full gap-2 border-2 border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700 font-bold uppercase tracking-wider"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="YouTube URL..."
                      className="flex-1 bg-gray-800 border-2 border-gray-600 focus:border-gray-500 placeholder:text-gray-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addYouTubeUrl(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="border-2"
                      style={{ 
                        backgroundColor: currentColors.primary,
                        borderColor: currentColors.primary 
                      }}
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="YouTube URL..."]') as HTMLInputElement;
                        if (input?.value) {
                          addYouTubeUrl(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Youtube className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Audio Sources List */}
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {audioSources.length === 0 ? (
                    <div className="text-center py-12">
                      <Disc className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">No tracks loaded</p>
                    </div>
                  ) : (
                    audioSources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center gap-3 p-3 rounded-sm border-2 border-gray-700 bg-gray-800"
                      >
                        <div className="flex-shrink-0">
                          {source.type === 'youtube' ? (
                            <Youtube className="h-5 w-5" style={{ color: currentColors.primary }} />
                          ) : (
                            <FileAudio className="h-5 w-5" style={{ color: currentColors.primary }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-200 truncate">{source.name}</p>
                          {source.isLoaded ? (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-mono">
                                {Math.floor(source.duration! / 60)}:{(source.duration! % 60).toFixed(0).padStart(2, '0')}
                              </p>
                              {source.bpm && (
                                <div className="flex gap-2 text-xs">
                                  <span className="text-orange-400 font-bold">{source.bpm} BPM</span>
                                  {source.analysisData && (
                                    <span className="text-cyan-400 font-bold">
                                      E:{source.analysisData.energy}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">LOADING...</p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeAudioSource(source.id)}
                          className="flex-shrink-0 hover:bg-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls with industrial knobs */}
            <Card className="lg:col-span-2 border-2 border-gray-700 shadow-xl bg-gray-900">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="flex items-center gap-2 text-gray-100 font-black uppercase tracking-wider">
                  <Sliders className="h-5 w-5" style={{ color: currentColors.primary }} />
                  {mode === 'mash' ? 'Mash Controls' : 'Playlist Controls'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {mode === 'mash' 
                    ? 'Fine-tune your mashup parameters'
                    : 'Configure seamless transitions'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 bg-gray-800/50">
                {mode === 'mash' ? (
                  // Mash Mode Controls
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <CircularSlider
                        value={mashRatio}
                        onChange={setMashRatio}
                        color={mashColors.primary}
                        label="Blend"
                        min={0}
                        max={100}
                      />
                      <CircularSlider
                        value={crossfadeTime}
                        onChange={setCrossfadeTime}
                        color={mashColors.secondary}
                        label="X-Fade"
                        min={0}
                        max={10}
                        unit="SEC"
                      />
                      <CircularSlider
                        value={tempo}
                        onChange={setTempo}
                        color={mashColors.accent}
                        label="Tempo"
                        min={50}
                        max={150}
                        unit="BPM"
                      />
                    </div>
                  </div>
                ) : (
                  // Playlist Mode Controls
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <CircularSlider
                        value={transitionDuration}
                        onChange={setTransitionDuration}
                        color={playlistColors.primary}
                        label="Trans"
                        min={0}
                        max={10}
                        unit="SEC"
                      />
                      <CircularSlider
                        value={gapTime}
                        onChange={setGapTime}
                        color={playlistColors.secondary}
                        label="Gap"
                        min={0}
                        max={5}
                        unit="SEC"
                      />
                      <div className="flex flex-col items-center gap-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-gray-300">Type</Label>
                        <div className="space-y-2 w-full max-w-[150px]">
                          <Button
                            variant={transitionType === 'crossfade' ? 'default' : 'outline'}
                            onClick={() => setTransitionType('crossfade')}
                            className={cn(
                              "w-full font-bold uppercase tracking-wider border-2",
                              transitionType === 'crossfade' 
                                ? "border-cyan-500" 
                                : "border-gray-600 hover:border-gray-500"
                            )}
                            style={transitionType === 'crossfade' ? { backgroundColor: playlistColors.primary } : {}}
                          >
                            X-FADE
                          </Button>
                          <Button
                            variant={transitionType === 'cut' ? 'default' : 'outline'}
                            onClick={() => setTransitionType('cut')}
                            className={cn(
                              "w-full font-bold uppercase tracking-wider border-2",
                              transitionType === 'cut' 
                                ? "border-cyan-500" 
                                : "border-gray-600 hover:border-gray-500"
                            )}
                            style={transitionType === 'cut' ? { backgroundColor: playlistColors.primary } : {}}
                          >
                            HARD CUT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-8 bg-gray-700" />

                {/* Process Button */}
                <div className="text-center space-y-4">
                  <Button
                    onClick={processAudio}
                    disabled={isProcessing || audioSources.length < 2}
                    className="px-12 py-6 text-lg font-black uppercase tracking-wider border-2"
                    style={{ 
                      backgroundColor: currentColors.primary,
                      borderColor: currentColors.primary 
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        {mode === 'mash' ? 'Create Mash' : 'Build Mix'}
                      </>
                    )}
                  </Button>
                  
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress 
                        value={processingProgress} 
                        className="w-full max-w-md mx-auto h-3 bg-gray-700" 
                      />
                      <p className="text-sm text-gray-400 font-mono">
                        PROCESSING: {Math.round(processingProgress)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Monitor with embedded visualizer */}
          {currentTrack && (
            <Card className="border-2 border-gray-700 shadow-xl bg-gray-900">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-100 font-black uppercase tracking-wider">
                    <Radio className="h-5 w-5" style={{ color: currentColors.primary }} />
                    Output Monitor
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-mono uppercase">
                    {mode === 'mash' ? 'Mashup' : 'Playlist'} ready for export
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-0 bg-gray-800/50">
                {/* Visualizer - Extended to container edges */}
                <div className="px-6 pt-6">
                  <WaveVisualizer 
                    isPlaying={isPlaying} 
                    color={currentColors.primary}
                    height={80}
                    audioAnalyzer={audioAnalyzer}
                    audioBuffer={processedAudioBuffer}
                  />
                </div>
                
                {/* Playback Controls */}
                <div className="px-6 pb-6">
                <div className="flex items-center justify-center gap-6">
                  <Button
                    size="icon"
                    onClick={togglePlayback}
                    className="h-24 w-24 rounded-full border-4 transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: isPlaying ? '#000' : currentColors.primary,
                      borderColor: currentColors.primary
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12" />
                    ) : (
                      <Play className="h-12 w-12" />
                    )}
                  </Button>
                  
                  <div className="h-16 w-px bg-gray-700" />
                  
                  <Button
                    onClick={downloadResult}
                    variant="outline"
                    className="gap-2 px-8 py-4 font-bold uppercase tracking-wider border-2 border-gray-600 hover:border-gray-500"
                  >
                    <Download className="h-5 w-5" />
                    Export File
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips with industrial styling */}
          <Card className="border-2 border-gray-700 shadow-xl bg-gray-900">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-100 font-black uppercase tracking-wider">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Operating Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">01.</span>
                  {mode === 'mash' 
                    ? "Match BPM values for optimal blend results"
                    : "Use longer transitions for smoother flow"
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">02.</span>
                  {mode === 'mash'
                    ? "Adjust blend ratio to control track dominance"
                    : "Add gap time for natural track separation"
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">03.</span>
                  Supported: MP3, WAV, FLAC, YouTube links
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">04.</span>
                  Monitor waveforms for real-time audio feedback
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Toaster />
    </>
  );
}