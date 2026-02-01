
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Annotation, AIFinding } from '../types';

interface InteractiveCanvasProps {
  imageSrc: string;
  annotations: Annotation[];
  aiFindings?: AIFinding[];
  onAddAnnotation: (ann: Annotation) => void;
  onClear: () => void;
}

const severityColors = {
  'Normal': '#10b981',
  'Mild': '#10b981',
  'Moderate': '#f59e0b',
  'Severe': '#ef4444',
  'Critical': '#7f1d1d'
};

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ imageSrc, annotations, aiFindings = [], onAddAnnotation, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Draw Global Precision Grid (Faint)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * canvas.width;
        const y = (i / 10) * canvas.height;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 2. Draw AI Findings with Enhanced Precision Style
      aiFindings.forEach(finding => {
        const color = severityColors[finding.severity] || '#3b82f6';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        
        const [ymin, xmin, ymax, xmax] = finding.box_2d;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const width = ((xmax - xmin) / 1000) * canvas.width;
        const height = ((ymax - ymin) / 1000) * canvas.height;

        // Draw Corner Brackets instead of full box for "Tech Precision" look
        const b = 15; // bracket size
        ctx.beginPath();
        // TL
        ctx.moveTo(x + b, y); ctx.lineTo(x, y); ctx.lineTo(x, y + b);
        // TR
        ctx.moveTo(x + width - b, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + b);
        // BL
        ctx.moveTo(x, y + height - b); ctx.lineTo(x, y + height); ctx.lineTo(x + b, y + height);
        // BR
        ctx.moveTo(x + width - b, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - b);
        ctx.stroke();

        // Draw Central Target Crosshair
        const cx = x + width/2;
        const cy = y + height/2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label Panel
        const labelText = `${finding.label.toUpperCase()} [${finding.severity}]`;
        ctx.font = 'black 9px Inter';
        const labelWidth = ctx.measureText(labelText).width;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, y - 18, labelWidth + 12, 18);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 6, y - 6);

        // Highlight
        ctx.fillStyle = `${color}15`;
        ctx.fillRect(x, y, width, height);
      });

      // 3. Draw Manual Measurements
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.font = 'bold 11px Inter';
      ctx.fillStyle = '#6366f1';

      annotations.forEach(ann => {
        if (ann.type === 'line' && ann.x2 !== undefined && ann.y2 !== undefined) {
          ctx.beginPath();
          ctx.moveTo(ann.x1, ann.y1);
          ctx.lineTo(ann.x2, ann.y2);
          ctx.stroke();
          
          const dist = Math.sqrt(Math.pow(ann.x2 - ann.x1, 2) + Math.pow(ann.y2 - ann.y1, 2)).toFixed(1);
          ctx.fillRect(ann.x1, ann.y1 - 25, 70, 20);
          ctx.fillStyle = 'white';
          ctx.fillText(`${dist}px`, ann.x1 + 8, ann.y1 - 11);
          ctx.fillStyle = '#6366f1';
          
          ctx.beginPath(); ctx.arc(ann.x1, ann.y1, 4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(ann.x2, ann.y2, 4, 0, Math.PI * 2); ctx.fill();
        }
      });

      // 4. Draw Active Drawing or Hover Crosshair
      if (isDrawing && startPos && currentPos) {
        ctx.strokeStyle = '#6366f1';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isHovering && mousePos) {
        // High-precision mouse crosshairs
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(mousePos.x, 0); ctx.lineTo(mousePos.x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, mousePos.y); ctx.lineTo(canvas.width, mousePos.y); ctx.stroke();
      }
    };

    const animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [annotations, aiFindings, isDrawing, currentPos, startPos, mousePos, isHovering]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    if (isDrawing) setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (isDrawing && startPos && currentPos) {
      const dist = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
      if (dist > 5) {
        onAddAnnotation({
          id: Math.random().toString(36).substr(2, 9),
          type: 'line', x1: startPos.x, y1: startPos.y, x2: currentPos.x, y2: currentPos.y,
          label: 'MEASURE'
        });
      }
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  // Magnifier Logic
  const magnifierSize = 160;
  const zoomFactor = 2.5;

  return (
    <div 
      className="relative w-full rounded-[2.5rem] overflow-hidden border border-slate-200 bg-slate-950 group shadow-2xl transition-all duration-700" 
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setMousePos(null); }}
    >
      <img ref={imageRef} src={imageSrc} className="w-full h-auto block opacity-90 transition-opacity group-hover:opacity-100" alt="Diagnostic Content" />
      
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-none z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      
      {/* Magnifier Lens */}
      {isHovering && mousePos && !isDrawing && (
        <div 
          className="absolute z-30 pointer-events-none rounded-full border-4 border-white/20 shadow-2xl overflow-hidden ring-4 ring-indigo-500/30"
          style={{
            width: magnifierSize,
            height: magnifierSize,
            left: mousePos.x - magnifierSize / 2,
            top: mousePos.y - magnifierSize / 2,
            backgroundImage: `url(${imageSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${(containerRef.current?.clientWidth || 0) * zoomFactor}px auto`,
            backgroundPosition: `-${mousePos.x * zoomFactor - magnifierSize / 2}px -${mousePos.y * zoomFactor - magnifierSize / 2}px`
          }}
        >
          {/* Inner Magnifier Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-px h-full bg-indigo-400"></div>
            <div className="h-px w-full bg-indigo-400 absolute"></div>
          </div>
        </div>
      )}

      {/* Interface Overlay */}
      <div className="absolute bottom-8 left-8 flex gap-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }} 
          className="px-6 py-3 bg-slate-900/80 backdrop-blur-xl text-white border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-rose-600 transition-all flex items-center gap-3"
        >
          <i className="fa-solid fa-microscope text-xs"></i> Reset Visuals
        </button>
      </div>

      <div className="absolute top-8 right-8 bg-indigo-600 text-white text-[9px] px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl z-20 pointer-events-none border border-indigo-400/30">
        <span className="flex items-center gap-2"><i className="fa-solid fa-crosshairs animate-pulse"></i> Ultra Precision [X{zoomFactor}]</span>
      </div>
    </div>
  );
};

export default InteractiveCanvas;
