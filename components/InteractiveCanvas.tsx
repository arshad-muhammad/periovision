
import React, { useRef, useState, useEffect } from 'react';
import { Annotation, AIFinding } from '../types';

interface InteractiveCanvasProps {
  imageSrc: string;
  annotations: Annotation[];
  aiFindings?: AIFinding[];
  onAddAnnotation: (ann: Annotation) => void;
  onClear: () => void;
}

const severityColors = {
  'Normal': '#10b981',   // emerald-500
  'Mild': '#10b981',     // emerald-500
  'Moderate': '#f59e0b', // amber-500
  'Severe': '#ef4444',   // red-500
  'Critical': '#7f1d1d'  // red-900
};

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ imageSrc, annotations, aiFindings = [], onAddAnnotation, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Draw AI Findings (Spatial Annotations)
      aiFindings.forEach(finding => {
        const color = severityColors[finding.severity] || '#3b82f6';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        
        // Coordinates in 0-1000 scale
        const [ymin, xmin, ymax, xmax] = finding.box_2d;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const width = ((xmax - xmin) / 1000) * canvas.width;
        const height = ((ymax - ymin) / 1000) * canvas.height;

        // Draw bounding box
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const labelText = `${finding.label} (${finding.severity})`;
        ctx.font = 'bold 11px Inter';
        const labelWidth = ctx.measureText(labelText).width;
        ctx.fillRect(x, y - 20, labelWidth + 10, 20);
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 5, y - 6);

        // Subtle overlay
        ctx.fillStyle = `${color}22`; // 22 is hex for ~13% opacity
        ctx.fillRect(x, y, width, height);
      });

      // 2. Draw Manual Annotations (Measurements)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.font = 'bold 12px Inter';
      ctx.fillStyle = '#3b82f6';

      annotations.forEach(ann => {
        if (ann.type === 'line' && ann.x2 !== undefined && ann.y2 !== undefined) {
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(ann.x1, ann.y1);
          ctx.lineTo(ann.x2, ann.y2);
          ctx.stroke();
          
          const dist = Math.sqrt(Math.pow(ann.x2 - ann.x1, 2) + Math.pow(ann.y2 - ann.y1, 2)).toFixed(1);
          ctx.fillText(`${ann.label}: ${dist}px`, ann.x1, ann.y1 - 8);
          
          ctx.beginPath();
          ctx.arc(ann.x1, ann.y1, 3, 0, Math.PI * 2);
          ctx.arc(ann.x2, ann.y2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw Active Drawing Line
      if (isDrawing && startPos && currentPos) {
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const currentDist = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)).toFixed(1);
        ctx.fillText(`${currentDist}px`, currentPos.x + 5, currentPos.y + 5);
      }
    };

    draw();
  }, [annotations, aiFindings, isDrawing, currentPos, startPos]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (isDrawing && startPos && currentPos) {
      const dist = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
      if (dist > 5) {
        onAddAnnotation({
          id: Math.random().toString(36).substr(2, 9),
          type: 'line',
          x1: startPos.x,
          y1: startPos.y,
          x2: currentPos.x,
          y2: currentPos.y,
          label: 'Measurement'
        });
      }
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 group shadow-2xl shadow-slate-200" ref={containerRef}>
      <img src={imageSrc} className="w-full h-auto block opacity-80" alt="Scan Viewer" />
      <canvas
        ref={canvasRef}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* Overlay controls */}
      <div className="absolute bottom-6 left-6 flex gap-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }} 
          className="px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold rounded-xl shadow-lg hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-eraser"></i> Clear Markers
        </button>
      </div>

      <div className="absolute top-6 right-6 bg-blue-600/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-lg z-20 pointer-events-none">
        <i className="fa-solid fa-crosshairs mr-2"></i> Precision Mode Active
      </div>
    </div>
  );
};

export default InteractiveCanvas;
