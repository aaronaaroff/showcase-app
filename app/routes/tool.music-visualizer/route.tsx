import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Upload, Play, Pause, RotateCcw, Plus, X, Layers, Eye, EyeOff } from "lucide-react";
import { cn } from "~/lib/utils";

type VisualizationStyle = "waveform" | "frequency" | "circular" | "particles" | "face" | "cube3d" | "spiral" | "dna";
type BlendMode = "normal" | "screen" | "multiply" | "overlay" | "difference";

interface Layer {
  id: string;
  style: VisualizationStyle;
  enabled: boolean;
  opacity: number;
  blendMode: BlendMode;
}

interface VisualizerSettings {
  waveform: {
    color: string;
    lineWidth: number;
    glow: boolean;
  };
  frequency: {
    barCount: number;
    color: string;
    gradient: boolean;
    mirror: boolean;
  };
  circular: {
    radius: number;
    bars: number;
    rotation: boolean;
    colorShift: boolean;
  };
  particles: {
    count: number;
    size: number;
    speed: number;
    reactive: boolean;
  };
  face: {
    eyeColor: string;
    mouthColor: string;
    expression: "happy" | "neutral" | "surprised";
    size: number;
  };
  cube3d: {
    cubeSize: number;
    gridSize: number;
    rotationSpeed: number;
    colorMode: "mono" | "spectrum" | "reactive";
  };
  spiral: {
    arms: number;
    speed: number;
    color: string;
    trail: boolean;
  };
  dna: {
    strands: number;
    color1: string;
    color2: string;
    rotationSpeed: number;
  };
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MusicVisualizer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", style: "waveform", enabled: true, opacity: 100, blendMode: "normal" }
  ]);
  const [settings, setSettings] = useState<VisualizerSettings>({
    waveform: {
      color: "#3b82f6",
      lineWidth: 2,
      glow: true,
    },
    frequency: {
      barCount: 64,
      color: "#8b5cf6",
      gradient: true,
      mirror: false,
    },
    circular: {
      radius: 100,
      bars: 128,
      rotation: true,
      colorShift: true,
    },
    particles: {
      count: 100,
      size: 3,
      speed: 1,
      reactive: true,
    },
    face: {
      eyeColor: "#ffffff",
      mouthColor: "#ff69b4",
      expression: "happy",
      size: 150,
    },
    cube3d: {
      cubeSize: 20,
      gridSize: 10,
      rotationSpeed: 1,
      colorMode: "spectrum",
    },
    spiral: {
      arms: 3,
      speed: 1,
      color: "#00ff88",
      trail: true,
    },
    dna: {
      strands: 2,
      color1: "#ff0080",
      color2: "#00ffff",
      rotationSpeed: 1,
    },
  });

  // Debounce settings for smooth performance
  const debouncedSettings = useDebounce(settings, 50);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
  const timeRef = useRef<number>(0);
  const cube3dRef = useRef<Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }>>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const initializeAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      initializeAudio();
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const resetVisualizer = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      style: "frequency",
      enabled: true,
      opacity: 100,
      blendMode: "screen",
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { color, lineWidth, glow } = debouncedSettings.waveform;
    
    if (glow) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [debouncedSettings.waveform]);

  const drawFrequency = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { barCount, color, gradient, mirror } = debouncedSettings.frequency;

    const barWidth = width / barCount;
    const barSpacing = barWidth * 0.2;
    const actualBarWidth = barWidth - barSpacing;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const barHeight = (dataArray[dataIndex] / 255) * height * 0.8;
      
      const x = i * barWidth + barSpacing / 2;
      const y = height - barHeight;

      if (gradient) {
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}33`);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }

      ctx.fillRect(x, y, actualBarWidth, barHeight);

      if (mirror) {
        ctx.fillRect(x, 0, actualBarWidth, barHeight);
      }
    }
  }, [debouncedSettings.frequency]);

  const drawCircular = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { radius, bars, rotation, colorShift } = debouncedSettings.circular;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    if (rotation) {
      ctx.rotate((timeRef.current / 1000) * 0.5);
    }

    const angleStep = (Math.PI * 2) / bars;

    for (let i = 0; i < bars; i++) {
      const dataIndex = Math.floor((i / bars) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;
      const barHeight = amplitude * radius;

      ctx.save();
      ctx.rotate(angleStep * i);

      if (colorShift) {
        const hue = (i / bars) * 360 + (timeRef.current / 100) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      } else {
        ctx.fillStyle = "#3b82f6";
      }

      ctx.fillRect(0, radius, 4, barHeight);
      ctx.restore();
    }

    ctx.restore();
  }, [debouncedSettings.circular]);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { count, size, speed, reactive } = debouncedSettings.particles;

    // Initialize particles if needed
    if (particlesRef.current.length < count) {
      for (let i = particlesRef.current.length; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          life: 1,
        });
      }
    }

    // Calculate average amplitude
    const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;

    particlesRef.current = particlesRef.current.slice(0, count).map((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Apply reactive forces
      if (reactive) {
        const force = avgAmplitude * 5;
        particle.vx += (Math.random() - 0.5) * force;
        particle.vy += (Math.random() - 0.5) * force;
      }

      // Damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      return particle;
    });

    // Draw particles
    particlesRef.current.forEach((particle, i) => {
      const dataIndex = Math.floor((i / count) * dataArray.length);
      const brightness = dataArray[dataIndex] / 255;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size * (reactive ? brightness + 0.5 : 1), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${brightness})`;
      ctx.fill();
    });
  }, [debouncedSettings.particles]);

  const drawFace = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { eyeColor, mouthColor, expression, size } = debouncedSettings.face;
    
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Calculate audio reactivity
    const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;
    const bassAmplitude = dataArray.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10 / 255;

    // Face outline
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eyes
    const eyeSize = size * 0.15;
    const eyeY = -size * 0.3;
    const eyeSpacing = size * 0.4;
    const pupilSize = eyeSize * (0.3 + avgAmplitude * 0.4);

    // Left eye
    ctx.beginPath();
    ctx.arc(-eyeSpacing / 2, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fillStyle = eyeColor;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-eyeSpacing / 2, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(eyeSpacing / 2, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fillStyle = eyeColor;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eyeSpacing / 2, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.strokeStyle = mouthColor;
    ctx.lineWidth = 4;
    
    const mouthY = size * 0.3;
    const mouthWidth = size * 0.6 * (0.5 + bassAmplitude * 0.5);
    
    if (expression === "happy") {
      ctx.arc(0, mouthY - size * 0.1, mouthWidth / 2, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (expression === "surprised") {
      const mouthHeight = size * 0.2 * (0.3 + avgAmplitude * 0.7);
      ctx.ellipse(0, mouthY, mouthWidth / 4, mouthHeight / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = mouthColor;
      ctx.fill();
    } else {
      ctx.moveTo(-mouthWidth / 2, mouthY);
      ctx.lineTo(mouthWidth / 2, mouthY);
    }
    ctx.stroke();

    ctx.restore();
  }, [debouncedSettings.face]);

  const drawCube3D = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { cubeSize, gridSize, rotationSpeed, colorMode } = debouncedSettings.cube3d;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Initialize cubes if needed
    if (cube3dRef.current.length === 0) {
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          cube3dRef.current.push({
            x: (x - gridSize / 2) * cubeSize * 2,
            y: (y - gridSize / 2) * cubeSize * 2,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
          });
        }
      }
    }

    const rotation = (timeRef.current / 1000) * rotationSpeed;
    const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;

    // Sort cubes by Z for proper rendering order
    const sortedCubes = [...cube3dRef.current].sort((a, b) => b.z - a.z);

    sortedCubes.forEach((cube, i) => {
      const dataIndex = Math.floor((i / cube3dRef.current.length) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255;

      // Apply rotation
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rotatedX = cube.x * cos - cube.z * sin;
      const rotatedZ = cube.x * sin + cube.z * cos;

      // Project 3D to 2D
      const perspective = 400;
      const scale = perspective / (perspective + rotatedZ);
      const projectedX = rotatedX * scale;
      const projectedY = cube.y * scale;

      // Update Z position based on audio
      cube.z = amplitude * 100 - 50;

      // Draw cube
      const size = cubeSize * scale * (0.5 + amplitude * 0.5);
      
      if (colorMode === "spectrum") {
        const hue = (i / cube3dRef.current.length) * 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.3 + amplitude * 0.7})`;
      } else if (colorMode === "reactive") {
        ctx.fillStyle = `rgba(${255 * amplitude}, ${100}, ${255 * (1 - amplitude)}, ${0.3 + amplitude * 0.7})`;
      } else {
        ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + amplitude * 0.7})`;
      }

      ctx.fillRect(projectedX - size / 2, projectedY - size / 2, size, size);
      
      // Draw edges
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.strokeRect(projectedX - size / 2, projectedY - size / 2, size, size);
    });

    ctx.restore();
  }, [debouncedSettings.cube3d]);

  const drawSpiral = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { arms, speed, color, trail } = debouncedSettings.spiral;

    if (!trail) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);

    const rotation = (timeRef.current / 1000) * speed;
    
    for (let arm = 0; arm < arms; arm++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / arms) * arm + rotation);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let i = 0; i < dataArray.length / 4; i++) {
        const dataIndex = i * 4;
        const amplitude = dataArray[dataIndex] / 255;
        const angle = i * 0.1;
        const radius = i * 2 * (0.5 + amplitude);
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [debouncedSettings.spiral]);

  const drawDNA = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const { width, height } = ctx.canvas;
    const { strands, color1, color2, rotationSpeed } = debouncedSettings.dna;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    const rotation = (timeRef.current / 1000) * rotationSpeed;
    const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;

    for (let strand = 0; strand < strands; strand++) {
      const offset = (Math.PI * 2 / strands) * strand;

      // Draw helix strands
      ctx.beginPath();
      ctx.strokeStyle = strand % 2 === 0 ? color1 : color2;
      ctx.lineWidth = 3;

      for (let i = -height / 2; i < height / 2; i += 5) {
        const dataIndex = Math.floor(((i + height / 2) / height) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        
        const x = Math.sin(i * 0.05 + rotation + offset) * (50 + amplitude * 100);
        const z = Math.cos(i * 0.05 + rotation + offset) * 50;
        
        // Simple 3D projection
        const scale = 1 + z / 200;
        const projectedX = x * scale;
        
        if (i === -height / 2) {
          ctx.moveTo(projectedX, i);
        } else {
          ctx.lineTo(projectedX, i);
        }
      }
      
      ctx.stroke();

      // Draw connecting bars
      if (strand === 0) {
        for (let i = -height / 2; i < height / 2; i += 30) {
          const dataIndex = Math.floor(((i + height / 2) / height) * dataArray.length);
          const amplitude = dataArray[dataIndex] / 255;
          
          const x1 = Math.sin(i * 0.05 + rotation) * (50 + amplitude * 100);
          const x2 = Math.sin(i * 0.05 + rotation + Math.PI) * (50 + amplitude * 100);
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + amplitude * 0.4})`;
          ctx.lineWidth = 1;
          ctx.moveTo(x1, i);
          ctx.lineTo(x2, i);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [debouncedSettings.dna]);

  const drawLayer = useCallback((ctx: CanvasRenderingContext2D, layer: Layer, dataArray: Uint8Array) => {
    ctx.save();
    ctx.globalAlpha = layer.opacity / 100;
    ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;

    switch (layer.style) {
      case "waveform":
        drawWaveform(ctx, dataArray);
        break;
      case "frequency":
        drawFrequency(ctx, dataArray);
        break;
      case "circular":
        drawCircular(ctx, dataArray);
        break;
      case "particles":
        drawParticles(ctx, dataArray);
        break;
      case "face":
        drawFace(ctx, dataArray);
        break;
      case "cube3d":
        drawCube3D(ctx, dataArray);
        break;
      case "spiral":
        drawSpiral(ctx, dataArray);
        break;
      case "dna":
        drawDNA(ctx, dataArray);
        break;
    }

    ctx.restore();
  }, [drawWaveform, drawFrequency, drawCircular, drawParticles, drawFace, drawCube3D, drawSpiral, drawDNA]);

  const visualize = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      timeRef.current = Date.now();

      // Clear canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get appropriate data for each layer
      layers.filter(layer => layer.enabled).forEach(layer => {
        if (layer.style === "waveform") {
          analyserRef.current!.getByteTimeDomainData(dataArray);
        } else {
          analyserRef.current!.getByteFrequencyData(dataArray);
        }
        drawLayer(ctx, layer, dataArray);
      });
    };

    draw();
  }, [layers, drawLayer]);

  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      visualize();
    } else {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, visualize]);

  const getSettingsForStyle = useCallback((style: VisualizationStyle) => {
    switch (style) {
      case "waveform":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color</Label>
              <input
                type="color"
                value={settings.waveform.color}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    waveform: { ...s.waveform, color: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Line Width: <span className="text-blue-400">{settings.waveform.lineWidth}px</span>
              </Label>
              <Slider
                value={[settings.waveform.lineWidth]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    waveform: { ...s.waveform, lineWidth: v[0] },
                  }))
                }
                min={1}
                max={10}
                step={1}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Glow Effect</Label>
              <Switch
                checked={settings.waveform.glow}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    waveform: { ...s.waveform, glow: checked },
                  }))
                }
              />
            </div>
          </div>
        );
      case "frequency":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Bar Count: <span className="text-purple-400">{settings.frequency.barCount}</span>
              </Label>
              <Slider
                value={[settings.frequency.barCount]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    frequency: { ...s.frequency, barCount: v[0] },
                  }))
                }
                min={16}
                max={256}
                step={16}
                className="[&_[role=slider]]:bg-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color</Label>
              <input
                type="color"
                value={settings.frequency.color}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    frequency: { ...s.frequency, color: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Gradient</Label>
              <Switch
                checked={settings.frequency.gradient}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    frequency: { ...s.frequency, gradient: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Mirror Effect</Label>
              <Switch
                checked={settings.frequency.mirror}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    frequency: { ...s.frequency, mirror: checked },
                  }))
                }
              />
            </div>
          </div>
        );
      case "circular":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Radius: <span className="text-cyan-400">{settings.circular.radius}px</span>
              </Label>
              <Slider
                value={[settings.circular.radius]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    circular: { ...s.circular, radius: v[0] },
                  }))
                }
                min={50}
                max={200}
                step={10}
                className="[&_[role=slider]]:bg-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Bar Count: <span className="text-cyan-400">{settings.circular.bars}</span>
              </Label>
              <Slider
                value={[settings.circular.bars]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    circular: { ...s.circular, bars: v[0] },
                  }))
                }
                min={32}
                max={256}
                step={32}
                className="[&_[role=slider]]:bg-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Rotation</Label>
              <Switch
                checked={settings.circular.rotation}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    circular: { ...s.circular, rotation: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Color Shift</Label>
              <Switch
                checked={settings.circular.colorShift}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    circular: { ...s.circular, colorShift: checked },
                  }))
                }
              />
            </div>
          </div>
        );
      case "particles":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Particle Count: <span className="text-pink-400">{settings.particles.count}</span>
              </Label>
              <Slider
                value={[settings.particles.count]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    particles: { ...s.particles, count: v[0] },
                  }))
                }
                min={10}
                max={500}
                step={10}
                className="[&_[role=slider]]:bg-pink-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Particle Size: <span className="text-pink-400">{settings.particles.size}px</span>
              </Label>
              <Slider
                value={[settings.particles.size]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    particles: { ...s.particles, size: v[0] },
                  }))
                }
                min={1}
                max={10}
                step={1}
                className="[&_[role=slider]]:bg-pink-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Speed: <span className="text-pink-400">{settings.particles.speed.toFixed(1)}</span>
              </Label>
              <Slider
                value={[settings.particles.speed]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    particles: { ...s.particles, speed: v[0] },
                  }))
                }
                min={0.1}
                max={5}
                step={0.1}
                className="[&_[role=slider]]:bg-pink-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Audio Reactive</Label>
              <Switch
                checked={settings.particles.reactive}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    particles: { ...s.particles, reactive: checked },
                  }))
                }
              />
            </div>
          </div>
        );
      case "face":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Eye Color</Label>
              <input
                type="color"
                value={settings.face.eyeColor}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    face: { ...s.face, eyeColor: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Mouth Color</Label>
              <input
                type="color"
                value={settings.face.mouthColor}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    face: { ...s.face, mouthColor: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Expression</Label>
              <Select
                value={settings.face.expression}
                onValueChange={(value: "happy" | "neutral" | "surprised") =>
                  setSettings((s) => ({
                    ...s,
                    face: { ...s.face, expression: value },
                  }))
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="surprised">Surprised</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Size: <span className="text-yellow-400">{settings.face.size}px</span>
              </Label>
              <Slider
                value={[settings.face.size]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    face: { ...s.face, size: v[0] },
                  }))
                }
                min={50}
                max={250}
                step={10}
                className="[&_[role=slider]]:bg-yellow-500"
              />
            </div>
          </div>
        );
      case "cube3d":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Cube Size: <span className="text-green-400">{settings.cube3d.cubeSize}px</span>
              </Label>
              <Slider
                value={[settings.cube3d.cubeSize]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    cube3d: { ...s.cube3d, cubeSize: v[0] },
                  }))
                }
                min={10}
                max={50}
                step={5}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Grid Size: <span className="text-green-400">{settings.cube3d.gridSize}x{settings.cube3d.gridSize}</span>
              </Label>
              <Slider
                value={[settings.cube3d.gridSize]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    cube3d: { ...s.cube3d, gridSize: v[0] },
                  }))
                }
                min={5}
                max={20}
                step={1}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Rotation Speed: <span className="text-green-400">{settings.cube3d.rotationSpeed.toFixed(1)}</span>
              </Label>
              <Slider
                value={[settings.cube3d.rotationSpeed]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    cube3d: { ...s.cube3d, rotationSpeed: v[0] },
                  }))
                }
                min={0}
                max={5}
                step={0.1}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color Mode</Label>
              <Select
                value={settings.cube3d.colorMode}
                onValueChange={(value: "mono" | "spectrum" | "reactive") =>
                  setSettings((s) => ({
                    ...s,
                    cube3d: { ...s.cube3d, colorMode: value },
                  }))
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mono">Monochrome</SelectItem>
                  <SelectItem value="spectrum">Spectrum</SelectItem>
                  <SelectItem value="reactive">Reactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "spiral":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Arms: <span className="text-orange-400">{settings.spiral.arms}</span>
              </Label>
              <Slider
                value={[settings.spiral.arms]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    spiral: { ...s.spiral, arms: v[0] },
                  }))
                }
                min={1}
                max={8}
                step={1}
                className="[&_[role=slider]]:bg-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Speed: <span className="text-orange-400">{settings.spiral.speed.toFixed(1)}</span>
              </Label>
              <Slider
                value={[settings.spiral.speed]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    spiral: { ...s.spiral, speed: v[0] },
                  }))
                }
                min={0.1}
                max={5}
                step={0.1}
                className="[&_[role=slider]]:bg-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color</Label>
              <input
                type="color"
                value={settings.spiral.color}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    spiral: { ...s.spiral, color: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <Label className="text-white font-semibold text-sm">Trail Effect</Label>
              <Switch
                checked={settings.spiral.trail}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    spiral: { ...s.spiral, trail: checked },
                  }))
                }
              />
            </div>
          </div>
        );
      case "dna":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Strands: <span className="text-red-400">{settings.dna.strands}</span>
              </Label>
              <Slider
                value={[settings.dna.strands]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    dna: { ...s.dna, strands: v[0] },
                  }))
                }
                min={1}
                max={4}
                step={1}
                className="[&_[role=slider]]:bg-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color 1</Label>
              <input
                type="color"
                value={settings.dna.color1}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    dna: { ...s.dna, color1: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">Color 2</Label>
              <input
                type="color"
                value={settings.dna.color2}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    dna: { ...s.dna, color2: e.target.value },
                  }))
                }
                className="w-full h-10 rounded cursor-pointer border-2 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white font-semibold text-sm">
                Rotation Speed: <span className="text-red-400">{settings.dna.rotationSpeed.toFixed(1)}</span>
              </Label>
              <Slider
                value={[settings.dna.rotationSpeed]}
                onValueChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    dna: { ...s.dna, rotationSpeed: v[0] },
                  }))
                }
                min={0.1}
                max={5}
                step={0.1}
                className="[&_[role=slider]]:bg-red-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [settings]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Music Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Audio Controls */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-400 transition-colors bg-gray-800/30">
                  <Upload className="w-5 h-5 text-gray-300" />
                  <span className="text-gray-300 font-medium">
                    {audioFile ? audioFile.name : "Upload audio file"}
                  </span>
                </div>
              </Label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <Button
              onClick={togglePlayback}
              disabled={!audioFile}
              size="icon"
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              onClick={resetVisualizer}
              disabled={!audioFile}
              size="icon"
              variant="outline"
              className="w-12 h-12 border-gray-600 hover:bg-gray-800"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Visualization Canvas */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={1024}
              height={576}
              className="w-full h-full"
            />
            {!audioFile && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 text-lg font-medium">Upload an audio file to start visualizing</p>
              </div>
            )}
          </div>

          {/* Layers Panel */}
          <div className="space-y-4 bg-gray-800/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-purple-400" />
                Layers
              </h3>
              <Button onClick={addLayer} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-1" />
                Add Layer
              </Button>
            </div>

            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 p-3 border border-gray-700 rounded-lg bg-gray-900/50 backdrop-blur"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateLayer(layer.id, { enabled: !layer.enabled })}
                    className={cn(
                      "w-8 h-8 transition-colors",
                      layer.enabled ? "text-green-400 hover:text-green-300" : "text-gray-500 hover:text-gray-400"
                    )}
                  >
                    {layer.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>

                  <Select
                    value={layer.style}
                    onValueChange={(value: VisualizationStyle) =>
                      updateLayer(layer.id, { style: value })
                    }
                  >
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waveform">Waveform</SelectItem>
                      <SelectItem value="frequency">Frequency</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="particles">Particles</SelectItem>
                      <SelectItem value="face">Face</SelectItem>
                      <SelectItem value="cube3d">3D Cubes</SelectItem>
                      <SelectItem value="spiral">Spiral</SelectItem>
                      <SelectItem value="dna">DNA Helix</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={layer.blendMode}
                    onValueChange={(value: BlendMode) =>
                      updateLayer(layer.id, { blendMode: value })
                    }
                  >
                    <SelectTrigger className="w-28 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="screen">Screen</SelectItem>
                      <SelectItem value="multiply">Multiply</SelectItem>
                      <SelectItem value="overlay">Overlay</SelectItem>
                      <SelectItem value="difference">Difference</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-400">
                      Opacity: <span className="text-white font-bold">{layer.opacity}%</span>
                    </Label>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={(v) => updateLayer(layer.id, { opacity: v[0] })}
                      min={0}
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-white"
                    />
                  </div>

                  {layers.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeLayer(layer.id)}
                      className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Style Settings */}
          <Tabs defaultValue={layers[0]?.style || "waveform"}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-800 p-1">
              <TabsTrigger value="waveform" className="data-[state=active]:bg-blue-600">Waveform</TabsTrigger>
              <TabsTrigger value="frequency" className="data-[state=active]:bg-purple-600">Frequency</TabsTrigger>
              <TabsTrigger value="circular" className="data-[state=active]:bg-cyan-600">Circular</TabsTrigger>
              <TabsTrigger value="particles" className="data-[state=active]:bg-pink-600">Particles</TabsTrigger>
              <TabsTrigger value="face" className="data-[state=active]:bg-yellow-600">Face</TabsTrigger>
              <TabsTrigger value="cube3d" className="data-[state=active]:bg-green-600">3D Cubes</TabsTrigger>
              <TabsTrigger value="spiral" className="data-[state=active]:bg-orange-600">Spiral</TabsTrigger>
              <TabsTrigger value="dna" className="data-[state=active]:bg-red-600">DNA</TabsTrigger>
            </TabsList>

            {(["waveform", "frequency", "circular", "particles", "face", "cube3d", "spiral", "dna"] as const).map((style) => (
              <TabsContent key={style} value={style} className="mt-6 bg-gray-800/30 p-4 rounded-lg">
                {getSettingsForStyle(style)}
              </TabsContent>
            ))}
          </Tabs>

          <audio ref={audioRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
}