'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface RasterSplitProps {
  imageSrc: string;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  minSplitDistance?: number;
  borderRadius?: number;
  splitMode?: 'half' | 'quadrant';
  splitRadius?: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function RasterSplit({
  imageSrc,
  maxWidth = 500,
  maxHeight = 500,
  className = '',
  minSplitDistance = 0,
  borderRadius = 16,
  splitMode = 'half',
  splitRadius = 0,
}: RasterSplitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const rectanglesRef = useRef<Rectangle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRenderRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: maxWidth, height: maxHeight });

  // Memoized color sampling function
  const getAverageColorFast = useCallback((
    x: number,
    y: number,
    w: number,
    h: number,
    canvasWidth: number,
    canvasHeight: number
  ): string => {
    if (!imageDataRef.current) return '#000000';
    if (w <= 0 || h <= 0) return '#000000';

    const imgData = imageDataRef.current;
    const imgWidth = imgData.width;
    const imgHeight = imgData.height;

    const scaleX = imgWidth / canvasWidth;
    const scaleY = imgHeight / canvasHeight;

    const imgX = Math.floor(x * scaleX);
    const imgY = Math.floor(y * scaleY);
    const imgW = Math.floor(w * scaleX);
    const imgH = Math.floor(h * scaleY);

    // Adaptive sampling - fewer samples for larger areas
    const area = imgW * imgH;
    const step = area > 10000 ? 8 : area > 2500 ? 4 : 2;

    let r = 0, g = 0, b = 0, count = 0;

    for (let py = imgY; py < imgY + imgH; py += step) {
      for (let px = imgX; px < imgX + imgW; px += step) {
        if (px >= 0 && px < imgWidth && py >= 0 && py < imgHeight) {
          const i = (py * imgWidth + px) * 4;
          r += imgData.data[i];
          g += imgData.data[i + 1];
          b += imgData.data[i + 2];
          count++;
        }
      }
    }

    if (count === 0) return '#000000';

    return `rgb(${(r / count) | 0}, ${(g / count) | 0}, ${(b / count) | 0})`;
  }, []);

  // Render using requestAnimationFrame for smoothness
  const scheduleRender = useCallback(() => {
    if (pendingRenderRef.current) return;
    pendingRenderRef.current = true;

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width: canvasWidth, height: canvasHeight } = canvasDimensions;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Batch draw all rectangles
      const rects = rectanglesRef.current;
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        ctx.fillStyle = rect.color;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }

      pendingRenderRef.current = false;
    });
  }, [canvasDimensions]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      imageRef.current = img;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const maxAspect = maxWidth / maxHeight;

      let canvasWidth, canvasHeight;

      if (imgAspect > maxAspect) {
        canvasWidth = maxWidth;
        canvasHeight = maxWidth / imgAspect;
      } else {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * imgAspect;
      }

      setCanvasDimensions({ width: canvasWidth, height: canvasHeight });

      // Pre-cache image data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0);
        imageDataRef.current = tempCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      }

      // Calculate initial average color and render immediately
      const avgColor = getAverageColorFast(0, 0, canvasWidth, canvasHeight, canvasWidth, canvasHeight);
      rectanglesRef.current = [{
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        color: avgColor,
      }];

      // Draw initial state
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = avgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      setIsLoaded(true);
    };

    return () => {
      imageRef.current = null;
      rectanglesRef.current = [];
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [imageSrc, maxWidth, maxHeight, getAverageColorFast]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const { width: canvasWidth, height: canvasHeight } = canvasDimensions;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const y = ((e.clientY - rect.top) / rect.height) * canvasHeight;

    // Check distance from last position
    if (lastPosRef.current && minSplitDistance > 0) {
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minSplitDistance) return;
    }

    lastPosRef.current = { x, y };

    // Find rectangles to split
    let targetRects: Rectangle[] = [];
    const currentRects = rectanglesRef.current;
    const minSize = 1; // Minimum rectangle size for fine detail

    if (splitRadius > 0) {
      const radiusSq = splitRadius * splitRadius;
      targetRects = currentRects.filter((r) => {
        if (r.width < minSize || r.height < minSize) return false;
        const rectCenterX = r.x + r.width / 2;
        const rectCenterY = r.y + r.height / 2;
        const dx = x - rectCenterX;
        const dy = y - rectCenterY;
        return dx * dx + dy * dy <= radiusSq;
      });
    } else {
      const targetRect = currentRects.find(
        (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
      );
      if (targetRect && targetRect.width >= minSize && targetRect.height >= minSize) {
        targetRects = [targetRect];
      }
    }

    if (targetRects.length === 0) return;

    // Create a Set for O(1) lookup
    const targetSet = new Set(targetRects);
    const newRects: Rectangle[] = [];

    // Filter out targets and collect non-targets
    for (let i = 0; i < currentRects.length; i++) {
      if (!targetSet.has(currentRects[i])) {
        newRects.push(currentRects[i]);
      }
    }

    // Split each target rectangle
    for (const targetRect of targetRects) {
      if (splitMode === 'quadrant') {
        const halfWidth = targetRect.width / 2;
        const halfHeight = targetRect.height / 2;
        const ceilW = Math.ceil(halfWidth);
        const floorW = Math.floor(halfWidth);
        const ceilH = Math.ceil(halfHeight);
        const floorH = Math.floor(halfHeight);

        newRects.push(
          {
            x: targetRect.x,
            y: targetRect.y,
            width: ceilW,
            height: ceilH,
            color: getAverageColorFast(targetRect.x, targetRect.y, ceilW, ceilH, canvasWidth, canvasHeight),
          },
          {
            x: targetRect.x + ceilW,
            y: targetRect.y,
            width: floorW,
            height: ceilH,
            color: getAverageColorFast(targetRect.x + ceilW, targetRect.y, floorW, ceilH, canvasWidth, canvasHeight),
          },
          {
            x: targetRect.x,
            y: targetRect.y + ceilH,
            width: ceilW,
            height: floorH,
            color: getAverageColorFast(targetRect.x, targetRect.y + ceilH, ceilW, floorH, canvasWidth, canvasHeight),
          },
          {
            x: targetRect.x + ceilW,
            y: targetRect.y + ceilH,
            width: floorW,
            height: floorH,
            color: getAverageColorFast(targetRect.x + ceilW, targetRect.y + ceilH, floorW, floorH, canvasWidth, canvasHeight),
          }
        );
      } else {
        const isLandscape = targetRect.width > targetRect.height;

        if (isLandscape) {
          const halfWidth = targetRect.width / 2;
          const ceilW = Math.ceil(halfWidth);
          const floorW = Math.floor(halfWidth);

          newRects.push(
            {
              x: targetRect.x,
              y: targetRect.y,
              width: ceilW,
              height: targetRect.height,
              color: getAverageColorFast(targetRect.x, targetRect.y, ceilW, targetRect.height, canvasWidth, canvasHeight),
            },
            {
              x: targetRect.x + ceilW,
              y: targetRect.y,
              width: floorW,
              height: targetRect.height,
              color: getAverageColorFast(targetRect.x + ceilW, targetRect.y, floorW, targetRect.height, canvasWidth, canvasHeight),
            }
          );
        } else {
          const halfHeight = targetRect.height / 2;
          const ceilH = Math.ceil(halfHeight);
          const floorH = Math.floor(halfHeight);

          newRects.push(
            {
              x: targetRect.x,
              y: targetRect.y,
              width: targetRect.width,
              height: ceilH,
              color: getAverageColorFast(targetRect.x, targetRect.y, targetRect.width, ceilH, canvasWidth, canvasHeight),
            },
            {
              x: targetRect.x,
              y: targetRect.y + ceilH,
              width: targetRect.width,
              height: floorH,
              color: getAverageColorFast(targetRect.x, targetRect.y + ceilH, targetRect.width, floorH, canvasWidth, canvasHeight),
            }
          );
        }
      }
    }

    rectanglesRef.current = newRects;
    scheduleRender();
  }, [isLoaded, canvasDimensions, minSplitDistance, splitRadius, splitMode, getAverageColorFast, scheduleRender]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasDimensions.width}
      height={canvasDimensions.height}
      className={className}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'crosshair',
        borderRadius: `${borderRadius}px`,
      }}
    />
  );
}
