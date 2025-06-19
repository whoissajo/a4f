'use client';

import { useRef, useEffect, HTMLAttributes } from 'react';

interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  // smoothing parameter is not used in the current draw logic but could be added
}

const useSpotlightEffect = (config: Required<SpotlightConfig>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentMouseX = -1000; // Start off-screen
    let currentMouseY = -1000; // Start off-screen
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const smoothingFactor = 0.08; // Adjust for more or less smoothing

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouseX = event.clientX;
      targetMouseY = event.clientY;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000; // Move target off-screen
      targetMouseY = -1000;
    };

    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    };

    const draw = () => {
      // Smoothly update mouse position towards the target
      currentMouseX += (targetMouseX - currentMouseX) * smoothingFactor;
      currentMouseY += (targetMouseY - currentMouseY) * smoothingFactor;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw if the spotlight is roughly on screen or moving towards it
      const drawThreshold = config.radius * 1.5; // A bit larger than radius to account for smoothing
      if (currentMouseX > -drawThreshold && currentMouseY > -drawThreshold &&
          currentMouseX < canvas.width + drawThreshold && currentMouseY < canvas.height + drawThreshold) {
        
        const gradient = ctx.createRadialGradient(
          currentMouseX, currentMouseY, 0,
          currentMouseX, currentMouseY, config.radius
        );
        const rgbColor = hexToRgb(config.color);
        gradient.addColorStop(0, `rgba(${rgbColor}, ${config.brightness})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Ensure full transparency at the edge

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Use document to track mouse even if not directly over a specific element
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave); // Handles mouse leaving the browser window
    
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.radius, config.brightness, config.color]);

  return canvasRef;
};

interface SpotlightCursorProps extends HTMLAttributes<HTMLCanvasElement> {
  config?: SpotlightConfig;
}

export const SpotlightCursor = ({
  config = {},
  className,
  ...rest
}: SpotlightCursorProps) => {
  // Default configuration for the spotlight effect
  const spotlightConfig: Required<SpotlightConfig> = {
    radius: 250,         // Default radius
    brightness: 0.1,     // Default brightness, subtle
    color: '#ffffff',    // Default color (white)
    ...config,           // User-provided config overrides defaults
  };

  const canvasRef = useSpotlightEffect(spotlightConfig);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] w-full h-full ${className || ''}`}
      aria-hidden="true" // Decorative element
      {...rest}
    />
  );
};
