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
  Gauge,
  Power,
  Volume2,
  Settings
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/header";

// Shared audio context for sound effects
let soundEffectContext: AudioContext | null = null;

// Industrial sound effects
const playIndustrialSound = (type: 'click' | 'switch' | 'knob' | 'heavy' | 'process') => {
  try {
    if (!soundEffectContext) {
      soundEffectContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = soundEffectContext;
    
    const createNoise = (duration: number, frequency: number, volume: number = 0.1) => {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
    
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    
    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    source.start();
    source.stop(audioContext.currentTime + duration);
  };
  
  switch (type) {
    case 'click':
      createNoise(0.05, 8000, 0.08);
      break;
    case 'switch':
      createNoise(0.1, 4000, 0.12);
      setTimeout(() => createNoise(0.03, 6000, 0.06), 20);
      break;
    case 'knob':
      createNoise(0.02, 12000, 0.05);
      break;
    case 'heavy':
      createNoise(0.15, 2000, 0.15);
      setTimeout(() => createNoise(0.1, 1500, 0.1), 50);
      break;
    case 'process':
      createNoise(0.3, 3000, 0.1);
      break;
  }
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};

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

// Industrial Toggle Switch Component
function IndustrialToggle({ 
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
  const handleToggle = (newValue: ModeType) => {
    playIndustrialSound('switch');
    onChange(newValue);
  };

  return (
    <div className="relative">
      {/* Metal housing with rivets */}
      <div className="relative bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 p-1 rounded-lg shadow-xl border border-gray-500">
        {/* Rivets */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-inner"></div>
        
        {/* Inner housing */}
        <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black p-2 rounded shadow-inner">
          <div className="flex">
            {/* Left switch */}
            <button
              onClick={() => handleToggle('mash')}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 transition-all duration-200 transform",
                "bg-gradient-to-b border-2 font-bold text-xs tracking-wider uppercase",
                "shadow-lg active:shadow-inner active:translate-y-0.5",
                value === 'mash' 
                  ? "from-orange-400 via-orange-500 to-orange-600 border-orange-300 text-black shadow-orange-500/50" 
                  : "from-gray-500 via-gray-600 to-gray-700 border-gray-400 text-gray-200 hover:from-gray-400"
              )}
              style={{
                borderRadius: '4px 0 0 4px',
                textShadow: value === 'mash' ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {LeftIcon && <LeftIcon className="h-3 w-3" />}
              {leftLabel}
            </button>
            
            {/* Right switch */}
            <button
              onClick={() => handleToggle('playlist')}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 transition-all duration-200 transform",
                "bg-gradient-to-b border-2 font-bold text-xs tracking-wider uppercase",
                "shadow-lg active:shadow-inner active:translate-y-0.5",
                value === 'playlist' 
                  ? "from-cyan-400 via-cyan-500 to-cyan-600 border-cyan-300 text-black shadow-cyan-500/50" 
                  : "from-gray-500 via-gray-600 to-gray-700 border-gray-400 text-gray-200 hover:from-gray-400"
              )}
              style={{
                borderRadius: '0 4px 4px 0',
                textShadow: value === 'playlist' ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {RightIcon && <RightIcon className="h-3 w-3" />}
              {rightLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Industrial Heavy-Duty Knob Component
function IndustrialKnob({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  size = 140, 
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
  const radius = size / 2 - 25;
  const angle = ((value - min) / (max - min)) * 270 - 135; // 270 degree range
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastSoundTime, setLastSoundTime] = useState(0);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    playIndustrialSound('knob');
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const now = Date.now();
    if (now - lastSoundTime > 100) {
      playIndustrialSound('knob');
      setLastSoundTime(now);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let degrees = (mouseAngle * 180) / Math.PI + 135;
    if (degrees < 0) degrees += 360;
    if (degrees > 270) degrees = degrees > 360 - 45 ? 0 : 270;
    
    const newValue = min + (degrees / 270) * (max - min);
    onChange(Math.max(min, Math.min(max, newValue)));
  };
  
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const syntheticEvent = e as unknown as React.MouseEvent;
      handleMouseMove(syntheticEvent);
    };
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Industrial label plate */}
      {label && (
        <div className="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 px-4 py-2 border border-gray-600 shadow-lg">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black text-xs font-bold uppercase tracking-wider px-2 py-1 shadow-inner">
            {label}
          </div>
        </div>
      )}
      
      {/* Knob housing */}
      <div className="relative">
        {/* Outer metal housing */}
        <div 
          className="relative bg-gradient-to-br from-gray-500 via-gray-600 to-gray-800 rounded-full p-3 shadow-2xl border-2 border-gray-400"
          style={{ width: size + 20, height: size + 20 }}
        >
          {/* Mounting screws */}
          {[0, 90, 180, 270].map((screwAngle) => {
            const screwRadius = (size + 20) / 2 - 8;
            const screwX = (size + 20) / 2 + screwRadius * Math.cos((screwAngle - 90) * Math.PI / 180);
            const screwY = (size + 20) / 2 + screwRadius * Math.sin((screwAngle - 90) * Math.PI / 180);
            return (
              <div
                key={screwAngle}
                className="absolute w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-700 rounded-full shadow-inner border border-gray-500"
                style={{
                  left: screwX - 6,
                  top: screwY - 6,
                }}
              >
                <div className="absolute inset-1 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full">
                  <div className="absolute inset-0.5 border-t border-gray-500 rounded-full"></div>
                  <div className="absolute inset-0.5 border-b border-gray-400 rounded-full"></div>
                </div>
              </div>
            );
          })}
          
          {/* Inner knob area */}
          <div 
            className="relative cursor-pointer select-none bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-full shadow-inner border border-gray-700"
            style={{ width: size, height: size }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg width={size} height={size} className="absolute inset-0">
              {/* Scale markings */}
              {Array.from({ length: 28 }).map((_, i) => {
                const markAngle = (i * 270 / 27 - 135) * Math.PI / 180;
                const innerR = radius - 8;
                const outerR = radius - 2;
                const isMajor = i % 9 === 0;
                return (
                  <line
                    key={i}
                    x1={center + innerR * Math.cos(markAngle)}
                    y1={center + innerR * Math.sin(markAngle)}
                    x2={center + outerR * Math.cos(markAngle)}
                    y2={center + outerR * Math.sin(markAngle)}
                    stroke={isMajor ? "#ffffff" : "#888888"}
                    strokeWidth={isMajor ? "2" : "1"}
                  />
                );
              })}
              
              {/* Active arc */}
              <path
                d={`M ${center + radius * Math.cos(-135 * Math.PI / 180)} ${center + radius * Math.sin(-135 * Math.PI / 180)} A ${radius} ${radius} 0 ${angle > 0 ? 1 : 0} 1 ${center + radius * Math.cos(angle * Math.PI / 180)} ${center + radius * Math.sin(angle * Math.PI / 180)}`}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
              
              {/* Knob body with worn metal texture */}
              <circle
                cx={center}
                cy={center}
                r={radius - 15}
                fill="url(#wornMetal)"
                stroke="url(#metalRim)"
                strokeWidth="3"
              />
              
              {/* Knob pointer */}
              <g transform={`rotate(${angle} ${center} ${center})`}>
                <rect
                  x={center - 2}
                  y={center - radius + 8}
                  width="4"
                  height={radius - 25}
                  fill="url(#pointerGrad)"
                  rx="2"
                />
                <circle
                  cx={center}
                  cy={center - radius + 15}
                  r="3"
                  fill={color}
                  style={{
                    filter: `drop-shadow(0 0 4px ${color})`,
                  }}
                />
              </g>
              
              {/* Center cap */}
              <circle
                cx={center}
                cy={center}
                r="8"
                fill="url(#centerCap)"
                stroke="#444"
                strokeWidth="1"
              />
              
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="wornMetal">
                  <stop offset="0%" stopColor="#6b7280" />
                  <stop offset="30%" stopColor="#4b5563" />
                  <stop offset="60%" stopColor="#374151" />
                  <stop offset="100%" stopColor="#1f2937" />
                </radialGradient>
                <linearGradient id="metalRim">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="50%" stopColor="#6b7280" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id="pointerGrad">
                  <stop offset="0%" stopColor="#f3f4f6" />
                  <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
                <radialGradient id="centerCap">
                  <stop offset="0%" stopColor="#6b7280" />
                  <stop offset="100%" stopColor="#374151" />
                </radialGradient>
              </defs>
            </svg>
            
            {/* Value display with LED-style */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-black/80 px-2 py-1 rounded border border-gray-600">
                <div 
                  className="text-2xl font-bold font-mono leading-none"
                  style={{ 
                    color: color,
                    textShadow: `0 0 8px ${color}`,
                    fontFamily: 'monospace'
                  }}
                >
                  {Math.round(value)}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mt-1">
                  {unit}
                </div>
              </div>
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
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      throw error;
    }
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

// 2D XY Pad Control for Bass/Treble styled like wave visualizer
function EQXYPadControl({ 
  bassValue, 
  trebleValue,
  onBassChange,
  onTrebleChange,
  width = 200,
  height = 120
}: {
  bassValue: number;
  trebleValue: number;
  onBassChange: (value: number) => void;
  onTrebleChange: (value: number) => void;
  width?: number;
  height?: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [animationOffset, setAnimationOffset] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: width || 200, height });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => prev + 0.08);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update container size when width is 0 (auto-size)
  useEffect(() => {
    if (width === 0 && containerRef.current) {
      const updateSize = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerSize({ width: rect.width - 24, height: rect.height - 60 }); // Subtract padding and header
        }
      };
      
      // Initial size calculation
      setTimeout(updateSize, 100); // Allow DOM to settle
      
      // Use ResizeObserver for better responsiveness
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      setContainerSize({ width: width || 200, height });
    }
  }, [width, height]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    playIndustrialSound('click');
    updateValues(e);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updateValues(e);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const updateValues = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to -100 to +100 range using current container size
    const bassVal = Math.round(((x / containerSize.width) * 200) - 100);
    const trebleVal = Math.round((((containerSize.height - y) / containerSize.height) * 200) - 100);
    
    onBassChange(Math.max(-100, Math.min(100, bassVal)));
    onTrebleChange(Math.max(-100, Math.min(100, trebleVal)));
    
    playIndustrialSound('knob');
  };
  
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const syntheticEvent = e as unknown as React.MouseEvent;
      handleMouseMove(syntheticEvent);
    };
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);
  
  // Convert values to pixel positions using current container size
  const posX = ((bassValue + 100) / 200) * containerSize.width;
  const posY = containerSize.height - ((trebleValue + 100) / 200) * containerSize.height;
  
  // Generate animated wave patterns based on EQ settings
  const generateEQWave = (amplitude: number, frequency: number, phase: number) => {
    const points = [];
    for (let x = 0; x <= containerSize.width; x += 4) {
      const bassInfluence = (bassValue / 100) * amplitude;
      const trebleInfluence = (trebleValue / 100) * amplitude * 0.7;
      const totalAmplitude = amplitude + bassInfluence + trebleInfluence;
      const y = (containerSize.height / 2) + totalAmplitude * Math.sin((x + animationOffset + phase) * frequency * 0.02);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };
  
  return (
    <div ref={containerRef} className="bg-black rounded-lg p-3 shadow-inner border-2 border-gray-700 w-full h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">EQ CONTROL</span>
      </div>
      
      <div 
        className="relative cursor-crosshair select-none bg-gradient-to-b from-gray-900 to-black rounded border border-gray-700 flex-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Grid lines */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${(i * 100) / 10}%`}
              x2="100%"
              y2={`${(i * 100) / 10}%`}
              stroke={i === 5 ? "rgba(0, 255, 0, 0.3)" : "rgba(0, 255, 0, 0.1)"}
              strokeWidth={i === 5 ? "2" : "1"}
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i * 100) / 10}%`}
              y1="0"
              x2={`${(i * 100) / 10}%`}
              y2="100%"
              stroke={i === 5 ? "rgba(0, 255, 0, 0.3)" : "rgba(0, 255, 0, 0.1)"}
              strokeWidth={i === 5 ? "2" : "1"}
            />
          ))}
          
          {/* Animated wave patterns representing EQ response */}
          <polyline
            points={generateEQWave(12, 1, 0)}
            fill="none"
            stroke="#ff6b35"
            strokeWidth="2"
            opacity="0.8"
            style={{
              filter: 'drop-shadow(0 0 6px #ff6b35)',
            }}
          />
          <polyline
            points={generateEQWave(8, 1.5, 100)}
            fill="none"
            stroke="#00d4ff"
            strokeWidth="1.5"
            opacity="0.6"
            style={{
              filter: 'drop-shadow(0 0 4px #00d4ff)',
            }}
          />
          
          {/* Control point */}
          <circle
            cx={`${(posX / containerSize.width) * 100}%`}
            cy={`${(posY / containerSize.height) * 100}%`}
            r="6"
            fill="rgba(255, 255, 255, 0.9)"
            stroke="#00ff00"
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 0 8px #00ff00)',
            }}
          />
          
          {/* Crosshairs */}
          <line
            x1={`${(posX / containerSize.width) * 100}%`}
            y1="0"
            x2={`${(posX / containerSize.width) * 100}%`}
            y2="100%"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <line
            x1="0"
            y1={`${(posY / containerSize.height) * 100}%`}
            x2="100%"
            y2={`${(posY / containerSize.height) * 100}%`}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </svg>
        
        {/* Value displays */}
        <div className="absolute top-1 left-1 text-xs font-mono text-orange-400 font-bold"
          style={{ textShadow: '0 0 4px #ff6b35' }}
        >
          B: {bassValue > 0 ? '+' : ''}{bassValue}
        </div>
        <div className="absolute top-1 right-1 text-xs font-mono text-cyan-400 font-bold"
          style={{ textShadow: '0 0 4px #00d4ff' }}
        >
          T: {trebleValue > 0 ? '+' : ''}{trebleValue}
        </div>
      </div>
      
      {/* Axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>BASS -100</span>
        <span>+100</span>
      </div>
      <div className="flex justify-center mt-1">
        <div className="text-xs text-gray-500 transform -rotate-90 origin-center w-0">
          <span className="inline-block whitespace-nowrap">TREBLE +100/-100</span>
        </div>
      </div>
    </div>
  );
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
    <div className="w-full h-full relative">
      <svg width="100%" height="100%" viewBox={`0 0 800 ${height}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
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
  
  // Audio controls
  const [bassLevel, setBassLevel] = useState(50);
  const [trebleLevel, setTrebleLevel] = useState(50);
  const [volume, setVolume] = useState(75);
  const [position, setPosition] = useState(0);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize audio analyzer
  useEffect(() => {
    try {
      setAudioAnalyzer(new AudioAnalyzer());
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
      toast({
        title: "Audio initialization failed",
        description: "Unable to initialize audio system. Please check your browser settings.",
        variant: "destructive"
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (currentAudioSource) {
        currentAudioSource.stop();
      }
    };
  }, []);

  // Clean up audio source and intervals when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudioSource) {
        currentAudioSource.stop();
        setCurrentAudioSource(null);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
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
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
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
        const startTime = (position / 100) * processedAudioBuffer.duration;
        
        source.onended = () => {
          setIsPlaying(false);
          setCurrentAudioSource(null);
          setCurrentPlaybackPosition(0);
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
        };
        
        source.start(0, startTime);
        setCurrentAudioSource(source);
        setIsPlaying(true);
        setTotalDuration(processedAudioBuffer.duration);
        setCurrentPlaybackPosition(startTime);
        
        // Update position during playback with precise timing
        const audioStartTime = audioAnalyzer.getAudioContext().currentTime;
        playbackIntervalRef.current = setInterval(() => {
          const elapsed = audioAnalyzer.getAudioContext().currentTime - audioStartTime;
          const currentPos = startTime + elapsed;
          if (currentPos >= processedAudioBuffer.duration) {
            setCurrentPlaybackPosition(processedAudioBuffer.duration);
            setIsPlaying(false);
            setCurrentAudioSource(null);
            if (playbackIntervalRef.current) {
              clearInterval(playbackIntervalRef.current);
              playbackIntervalRef.current = null;
            }
          } else {
            setCurrentPlaybackPosition(currentPos);
          }
        }, 100); // Update every 100ms for smooth progress
        
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
      {/* Studio Background */}
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Studio ambient lighting */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        
        <div className="relative w-full mx-auto p-2 sm:p-4 flex items-center justify-center min-h-screen">
          {/* Full width responsive layout */}
          <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-2 sm:gap-4 items-start">
            {/* Left sidebar - Input/Output Section */}
            <div className="space-y-2 sm:space-y-4 order-2 lg:order-1">
              {/* Input Section */}
              <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-lg shadow-xl border-4 border-gray-700 p-3 sm:p-4">
                <div className="text-center mb-3">
                  <div className="bg-gradient-to-b from-gray-900 to-black px-4 py-2 rounded border border-gray-700 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">INPUT DECK</span>
                  </div>
                </div>
                
                {/* Audio sources display */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded p-3 border border-gray-700 shadow-inner mb-3">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {audioSources.length === 0 ? (
                      <div className="text-center py-4">
                        <Disc className="h-8 w-8 mx-auto text-gray-600 mb-2 animate-pulse" />
                        <p className="text-sm font-bold text-gray-500 uppercase">INSERT MEDIA</p>
                      </div>
                    ) : (
                      audioSources.map((source) => (
                        <div key={source.id} className="bg-gradient-to-r from-gray-700 to-gray-800 rounded px-3 py-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-mono text-gray-300 truncate flex-1">{source.name}</span>
                            {source.bpm && (
                              <span className="text-sm font-bold text-orange-400">{source.bpm}</span>
                            )}
                            <button
                              onClick={() => {
                                playIndustrialSound('click');
                                removeAudioSource(source.id);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {source.duration && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 uppercase tracking-wider">Duration:</span>
                              <span className="text-cyan-400 font-mono">
                                {Math.floor(source.duration / 60)}:{String(Math.floor(source.duration % 60)).padStart(2, '0')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Load button */}
                <button
                  onClick={() => {
                    playIndustrialSound('heavy');
                    fileInputRef.current?.click();
                  }}
                  className="w-full bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-700 rounded px-4 py-3 shadow-lg active:shadow-inner active:translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4 text-gray-300" />
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">LOAD AUDIO</span>
                  </div>
                </button>
              </div>
              
              {/* Output Section */}
              <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-lg shadow-xl border-4 border-gray-700 p-4">
                <div className="text-center mb-3">
                  <div className="bg-gradient-to-b from-gray-900 to-black px-4 py-2 rounded border border-gray-700 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">OUTPUT CONTROL</span>
                  </div>
                </div>
                
                {/* Audio player controls */}
                {currentTrack && (
                  <div className="space-y-3 mb-4">
                    {/* Volume slider */}
                    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded p-3 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-4 w-4 text-gray-400" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => {
                            playIndustrialSound('knob');
                            setVolume(Number(e.target.value));
                          }}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #374151 ${volume}%, #374151 100%)`
                          }}
                        />
                        <span className="text-sm font-mono text-green-400 w-10 text-center">{volume}</span>
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">VOLUME</span>
                      </div>
                    </div>
                    
                    {/* Audio player-style position control */}
                    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded p-3 border border-gray-700">
                      {/* Time display and controls */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-blue-400">
                          {totalDuration > 0 
                            ? `${Math.floor(currentPlaybackPosition / 60)}:${String(Math.floor(currentPlaybackPosition % 60)).padStart(2, '0')}` 
                            : '0:00'
                          }
                        </span>
                        <span className="text-sm font-mono text-gray-500">
                          -{totalDuration > 0 
                            ? `${Math.floor((totalDuration - currentPlaybackPosition) / 60)}:${String(Math.floor((totalDuration - currentPlaybackPosition) % 60)).padStart(2, '0')}` 
                            : '0:00'
                          }
                        </span>
                      </div>
                      
                      {/* Playback progress bar */}
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={totalDuration > 0 ? (currentPlaybackPosition / totalDuration) * 100 : position}
                          onChange={(e) => {
                            playIndustrialSound('knob');
                            const newPosition = Number(e.target.value);
                            setPosition(newPosition);
                            
                            // If playing, seek to new position
                            if (isPlaying && currentAudioSource && processedAudioBuffer) {
                              currentAudioSource.stop();
                              const newStartTime = (newPosition / 100) * processedAudioBuffer.duration;
                              setCurrentPlaybackPosition(newStartTime);
                              
                              // Start new source at new position
                              const newSource = audioAnalyzer.createSource(processedAudioBuffer);
                              newSource.onended = () => {
                                setIsPlaying(false);
                                setCurrentAudioSource(null);
                                setCurrentPlaybackPosition(0);
                              };
                              newSource.start(0, newStartTime);
                              setCurrentAudioSource(newSource);
                            }
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${totalDuration > 0 ? (currentPlaybackPosition / totalDuration) * 100 : position}%, #374151 ${totalDuration > 0 ? (currentPlaybackPosition / totalDuration) * 100 : position}%, #374151 100%)`
                          }}
                        />
                        {/* Progress indicator dot */}
                        <div 
                          className="absolute top-0 w-4 h-2 bg-blue-500 rounded-full shadow-lg transform -translate-x-1/2 pointer-events-none"
                          style={{
                            left: `${totalDuration > 0 ? (currentPlaybackPosition / totalDuration) * 100 : position}%`,
                            filter: 'drop-shadow(0 0 4px #3b82f6)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Process button */}
                <button
                  onClick={() => {
                    playIndustrialSound('process');
                    processAudio();
                  }}
                  disabled={isProcessing || audioSources.length < 2}
                  className={cn(
                    "w-full bg-gradient-to-b border-2 rounded shadow-lg transition-all p-3 mb-3",
                    "active:shadow-inner active:translate-y-0.5",
                    !isProcessing && audioSources.length >= 2 
                      ? "from-red-600 to-red-800 border-red-700" 
                      : "from-gray-600 to-gray-800 border-gray-700"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">PROCESSING</span>
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 text-gray-300" />
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">
                          {mode === 'mash' ? 'MASH TRACKS' : 'BUILD LIST'}
                        </span>
                      </>
                    )}
                  </div>
                </button>
                
                {/* Audio player-style controls */}
                {currentTrack && (
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {/* Main play/pause button */}
                    <button
                      onClick={() => {
                        playIndustrialSound('heavy');
                        togglePlayback();
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 shadow-lg active:shadow-inner active:translate-y-0.5 transition-all flex items-center justify-center",
                        isPlaying 
                          ? "bg-gradient-to-b from-red-500 to-red-700 border-red-400" 
                          : "bg-gradient-to-b from-green-500 to-green-700 border-green-400"
                      )}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 text-white" />
                      ) : (
                        <Play className="h-6 w-6 text-white ml-0.5" />
                      )}
                    </button>
                    
                    {/* Download button */}
                    <button
                      onClick={() => {
                        playIndustrialSound('click');
                        downloadResult();
                      }}
                      className="bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-700 rounded px-4 py-2 shadow-lg active:shadow-inner active:translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase">DOWNLOAD</span>
                      </div>
                    </button>
                  </div>
                )}
                
                {/* Progress indicator */}
                {isProcessing && (
                  <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded p-2 border border-gray-700 mt-3">
                    <Progress 
                      value={processingProgress} 
                      className="h-2 bg-gray-700" 
                    />
                    <p className="text-xs font-mono text-center mt-2 text-gray-400">
                      {Math.round(processingProgress)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Boombox Unit */}
            <div className="relative order-1 lg:order-2">
              {/* Outer casing with realistic depth */}
              <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-lg shadow-2xl"
                style={{
                  boxShadow: `
                    0 50px 100px -20px rgba(0, 0, 0, 0.8),
                    0 30px 60px -30px rgba(0, 0, 0, 0.9),
                    inset 0 2px 4px rgba(255, 255, 255, 0.1),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.8)
                  `
                }}
              >
                {/* Top handle */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-40 h-6">
                  <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-full h-full shadow-lg border-2 border-gray-600"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="h-full rounded-full bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50"></div>
                  </div>
                </div>
                
                {/* Main body */}
                <div className="relative p-2 sm:p-4 rounded-lg bg-gradient-to-b from-gray-800 via-gray-850 to-gray-900 border-4 border-gray-700">
                  {/* Textured surface */}
                  <div className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 2px,
                          rgba(0, 0, 0, 0.1) 2px,
                          rgba(0, 0, 0, 0.1) 4px
                        ),
                        repeating-linear-gradient(
                          -45deg,
                          transparent,
                          transparent 2px,
                          rgba(0, 0, 0, 0.1) 2px,
                          rgba(0, 0, 0, 0.1) 4px
                        )
                      `
                    }}
                  />
                  
                  {/* Top section with brand and controls */}
                  <div className="relative z-10 space-y-2 sm:space-y-4">
                    {/* Brand plate */}
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-b from-gray-900 to-black px-6 py-2 rounded-sm shadow-inner border border-gray-700">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider bg-gradient-to-b from-gray-300 to-gray-500 bg-clip-text text-transparent"
                          style={{
                            fontFamily: 'Impact, sans-serif',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                            letterSpacing: '0.15em'
                          }}
                        >
                          MASHER
                        </h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                          PRO AUDIO SYSTEM
                        </p>
                      </div>
                    </div>
                    
                    {/* Main control section with new layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 items-start">
                      {/* Left side - Vertical mode controls and settings */}
                      <div className="space-y-4 h-full flex flex-col">
                        {/* Mode selector */}
                        <div className="bg-black rounded-lg p-2 shadow-inner border-2 border-gray-700 flex-shrink-0">
                          <IndustrialToggle
                            value={mode}
                            onChange={setMode}
                            leftLabel="MASH"
                            rightLabel="LIST"
                            leftIcon={Blend}
                            rightIcon={ListMusic}
                          />
                        </div>
                        
                        {/* Vertical control knobs section - Full Height */}
                        <div className="bg-black rounded-lg p-3 shadow-inner border-2 border-gray-700 flex-1">
                          <div className="space-y-3 h-full flex flex-col justify-evenly">
                            {/* Main blend controls - vertical layout */}
                            {mode === 'mash' ? (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="transform scale-75 origin-center">
                                    <IndustrialKnob
                                      value={mashRatio}
                                      onChange={setMashRatio}
                                      color="#ff6b35"
                                      label="BLEND"
                                      min={0}
                                      max={100}
                                      unit="%"
                                      size={60}
                                    />
                                  </div>
                                  <div className="bg-black/80 px-3 py-2 rounded border border-gray-600">
                                    <div className="text-center">
                                      <div className="text-lg font-bold font-mono text-orange-400" style={{ textShadow: '0 0 6px #ff6b35' }}>
                                        {Math.round(mashRatio)}%
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase">BLEND</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="transform scale-75 origin-center">
                                    <IndustrialKnob
                                      value={crossfadeTime}
                                      onChange={setCrossfadeTime}
                                      color="#ffb627"
                                      label="FADE"
                                      min={0}
                                      max={10}
                                      unit="SEC"
                                      size={60}
                                    />
                                  </div>
                                  <div className="bg-black/80 px-3 py-2 rounded border border-gray-600">
                                    <div className="text-center">
                                      <div className="text-lg font-bold font-mono text-yellow-400" style={{ textShadow: '0 0 6px #ffb627' }}>
                                        {crossfadeTime.toFixed(1)}s
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase">FADE</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="transform scale-75 origin-center">
                                    <IndustrialKnob
                                      value={tempo}
                                      onChange={setTempo}
                                      color="#f7931e"
                                      label="TEMPO"
                                      min={50}
                                      max={150}
                                      unit="BPM"
                                      size={60}
                                    />
                                  </div>
                                  <div className="bg-black/80 px-3 py-2 rounded border border-gray-600">
                                    <div className="text-center">
                                      <div className="text-lg font-bold font-mono text-orange-300" style={{ textShadow: '0 0 6px #f7931e' }}>
                                        {Math.round(tempo)}
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase">BPM</div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="transform scale-75 origin-center">
                                    <IndustrialKnob
                                      value={transitionDuration}
                                      onChange={setTransitionDuration}
                                      color="#00d4ff"
                                      label="TRANS"
                                      min={0}
                                      max={10}
                                      unit="SEC"
                                      size={60}
                                    />
                                  </div>
                                  <div className="bg-black/80 px-3 py-2 rounded border border-gray-600">
                                    <div className="text-center">
                                      <div className="text-lg font-bold font-mono text-cyan-400" style={{ textShadow: '0 0 6px #00d4ff' }}>
                                        {transitionDuration.toFixed(1)}s
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase">TRANS</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="transform scale-75 origin-center">
                                    <IndustrialKnob
                                      value={gapTime}
                                      onChange={setGapTime}
                                      color="#0099cc"
                                      label="GAP"
                                      min={0}
                                      max={5}
                                      unit="SEC"
                                      size={60}
                                    />
                                  </div>
                                  <div className="bg-black/80 px-3 py-2 rounded border border-gray-600">
                                    <div className="text-center">
                                      <div className="text-lg font-bold font-mono text-blue-400" style={{ textShadow: '0 0 6px #0099cc' }}>
                                        {gapTime.toFixed(1)}s
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase">GAP</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Transition type selector for playlist mode */}
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      playIndustrialSound('click');
                                      setTransitionType('crossfade');
                                    }}
                                    className={cn(
                                      "px-3 py-2 rounded text-xs font-bold uppercase tracking-wider border transition-all active:scale-95",
                                      transitionType === 'crossfade' 
                                        ? "bg-cyan-600 border-cyan-400 text-white" 
                                        : "bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500"
                                    )}
                                  >
                                    CROSSFADE
                                  </button>
                                  <button
                                    onClick={() => {
                                      playIndustrialSound('click');
                                      setTransitionType('cut');
                                    }}
                                    className={cn(
                                      "px-3 py-2 rounded text-xs font-bold uppercase tracking-wider border transition-all active:scale-95",
                                      transitionType === 'cut' 
                                        ? "bg-cyan-600 border-cyan-400 text-white" 
                                        : "bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500"
                                    )}
                                  >
                                    HARD CUT
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side - Spectrum analyzer and EQ control */}
                      <div className="space-y-4 h-full flex flex-col">
                        {/* VU Meter Display */}
                        <div className="bg-black rounded-lg p-2 shadow-inner border-2 border-gray-700 flex-shrink-0">
                          <div className="bg-gradient-to-b from-gray-900 to-black rounded p-2 border border-gray-800">
                            {/* LCD-style spectrum display */}
                            <div className="h-20 relative overflow-hidden bg-gradient-to-b from-green-950 to-black rounded">
                              <WaveVisualizer 
                                isPlaying={isPlaying} 
                                color="#00ff00"
                                height={80}
                                audioAnalyzer={audioAnalyzer}
                                audioBuffer={processedAudioBuffer}
                              />
                              {/* VU grid overlay */}
                              <div className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundImage: `
                                    repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0, 0, 0, 0.3) 7px, rgba(0, 0, 0, 0.3) 8px),
                                    repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0, 0, 0, 0.3) 7px, rgba(0, 0, 0, 0.3) 8px)
                                  `
                                }}
                              />
                            </div>
                            <div className="text-center mt-1">
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">SPECTRUM ANALYZER</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Combined Bass/Treble EQ Control - Full Width and Flex */}
                        <div className="w-full flex-1">
                          <EQXYPadControl
                            bassValue={bassLevel}
                            trebleValue={trebleLevel}
                            onBassChange={setBassLevel}
                            onTrebleChange={setTrebleLevel}
                            width={0} // Will be calculated to full width
                            height={200}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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