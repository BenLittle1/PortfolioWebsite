'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface RasterSplitProps {
  imageSrc: string;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  minSplitDistance?: number;
  borderRadius?: number;
  splitMode?: 'half' | 'quadrant';
  splitRadius?: number;
  minCellSize?: number;
  onInteractionStart?: () => void;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const DEFAULT_DIMENSIONS = { width: 500, height: 500 };

function distanceToRectangle(
  x: number,
  y: number,
  rect: Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>
) {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));

  return Math.sqrt(dx * dx + dy * dy);
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
  minCellSize = 2,
  onInteractionStart,
}: RasterSplitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const rectanglesRef = useRef<Rectangle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRenderRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const pointerDownRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState(DEFAULT_DIMENSIONS);

  const getAverageColorFast = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      canvasWidth: number,
      canvasHeight: number
    ) => {
      const imageData = imageDataRef.current;

      if (!imageData || width <= 0 || height <= 0) {
        return '#000000';
      }

      const scaleX = imageData.width / canvasWidth;
      const scaleY = imageData.height / canvasHeight;

      const startX = Math.max(0, Math.floor(x * scaleX));
      const startY = Math.max(0, Math.floor(y * scaleY));
      const endX = Math.min(imageData.width, Math.ceil((x + width) * scaleX));
      const endY = Math.min(imageData.height, Math.ceil((y + height) * scaleY));
      const sampleWidth = Math.max(1, endX - startX);
      const sampleHeight = Math.max(1, endY - startY);
      const sampleArea = sampleWidth * sampleHeight;
      const step = sampleArea > 10000 ? 8 : sampleArea > 2500 ? 4 : 2;

      let red = 0;
      let green = 0;
      let blue = 0;
      let sampleCount = 0;

      for (let sampleY = startY; sampleY < endY; sampleY += step) {
        for (let sampleX = startX; sampleX < endX; sampleX += step) {
          const pixelIndex = (sampleY * imageData.width + sampleX) * 4;
          red += imageData.data[pixelIndex];
          green += imageData.data[pixelIndex + 1];
          blue += imageData.data[pixelIndex + 2];
          sampleCount += 1;
        }
      }

      if (!sampleCount) {
        return '#000000';
      }

      return `rgb(${Math.round(red / sampleCount)}, ${Math.round(
        green / sampleCount
      )}, ${Math.round(blue / sampleCount)})`;
    },
    []
  );

  const buildRectangle = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      canvasWidth: number,
      canvasHeight: number
    ): Rectangle | null => {
      if (width <= 0 || height <= 0) {
        return null;
      }

      return {
        x,
        y,
        width,
        height,
        color: getAverageColorFast(x, y, width, height, canvasWidth, canvasHeight),
      };
    },
    [getAverageColorFast]
  );

  const drawRectangles = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    for (const rect of rectanglesRef.current) {
      context.fillStyle = rect.color;
      context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }, [canvasDimensions.height, canvasDimensions.width]);

  const scheduleRender = useCallback(() => {
    if (pendingRenderRef.current) {
      return;
    }

    pendingRenderRef.current = true;

    rafRef.current = requestAnimationFrame(() => {
      pendingRenderRef.current = false;
      drawRectangles();
    });
  }, [drawRectangles]);

  const splitRectangle = useCallback(
    (rect: Rectangle, canvasWidth: number, canvasHeight: number) => {
      const canSplitHorizontally = rect.width > minCellSize;
      const canSplitVertically = rect.height > minCellSize;
      const nextRects: Rectangle[] = [];

      const pushRect = (x: number, y: number, width: number, height: number) => {
        const nextRect = buildRectangle(x, y, width, height, canvasWidth, canvasHeight);

        if (nextRect) {
          nextRects.push(nextRect);
        }
      };

      if (!canSplitHorizontally && !canSplitVertically) {
        return [];
      }

      if (splitMode === 'quadrant' && canSplitHorizontally && canSplitVertically) {
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const leftWidth = Math.ceil(halfWidth);
        const rightWidth = Math.floor(halfWidth);
        const topHeight = Math.ceil(halfHeight);
        const bottomHeight = Math.floor(halfHeight);

        pushRect(rect.x, rect.y, leftWidth, topHeight);
        pushRect(rect.x + leftWidth, rect.y, rightWidth, topHeight);
        pushRect(rect.x, rect.y + topHeight, leftWidth, bottomHeight);
        pushRect(rect.x + leftWidth, rect.y + topHeight, rightWidth, bottomHeight);
      } else if (
        canSplitHorizontally &&
        (!canSplitVertically || rect.width >= rect.height)
      ) {
        const halfWidth = rect.width / 2;
        const leftWidth = Math.ceil(halfWidth);
        const rightWidth = Math.floor(halfWidth);

        pushRect(rect.x, rect.y, leftWidth, rect.height);
        pushRect(rect.x + leftWidth, rect.y, rightWidth, rect.height);
      } else if (canSplitVertically) {
        const halfHeight = rect.height / 2;
        const topHeight = Math.ceil(halfHeight);
        const bottomHeight = Math.floor(halfHeight);

        pushRect(rect.x, rect.y, rect.width, topHeight);
        pushRect(rect.x, rect.y + topHeight, rect.width, bottomHeight);
      }

      return nextRects;
    },
    [buildRectangle, minCellSize, splitMode]
  );

  useEffect(() => {
    let cancelled = false;

    setIsLoaded(false);
    lastPosRef.current = null;
    hasInteractedRef.current = false;
    rectanglesRef.current = [];

    const image = new Image();
    image.decoding = 'async';
    image.src = imageSrc;

    image.onload = () => {
      if (cancelled) {
        return;
      }

      const imageAspect = image.naturalWidth / image.naturalHeight;
      const maxAspect = maxWidth / maxHeight;

      const width = Math.round(imageAspect > maxAspect ? maxWidth : maxHeight * imageAspect);
      const height = Math.round(imageAspect > maxAspect ? maxWidth / imageAspect : maxHeight);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.naturalWidth;
      tempCanvas.height = image.naturalHeight;

      const tempContext = tempCanvas.getContext('2d', { willReadFrequently: true });

      if (!tempContext) {
        return;
      }

      tempContext.drawImage(image, 0, 0);
      imageDataRef.current = tempContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
      setCanvasDimensions({ width, height });
      setIsLoaded(true);
    };

    return () => {
      cancelled = true;
      imageDataRef.current = null;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      pendingRenderRef.current = false;
      pointerDownRef.current = false;
    };
  }, [imageSrc, maxHeight, maxWidth]);

  useEffect(() => {
    if (!isLoaded || !imageDataRef.current) {
      return;
    }

    const initialRect = buildRectangle(
      0,
      0,
      canvasDimensions.width,
      canvasDimensions.height,
      canvasDimensions.width,
      canvasDimensions.height
    );

    rectanglesRef.current = initialRect ? [initialRect] : [];
    scheduleRender();
  }, [buildRectangle, canvasDimensions.height, canvasDimensions.width, isLoaded, scheduleRender]);

  const revealAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!isLoaded || !canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const bounds = canvas.getBoundingClientRect();

      if (!bounds.width || !bounds.height) {
        return;
      }

      const x = ((clientX - bounds.left) / bounds.width) * canvasDimensions.width;
      const y = ((clientY - bounds.top) / bounds.height) * canvasDimensions.height;

      if (lastPosRef.current && minSplitDistance > 0) {
        const deltaX = x - lastPosRef.current.x;
        const deltaY = y - lastPosRef.current.y;

        if (Math.hypot(deltaX, deltaY) < minSplitDistance) {
          return;
        }
      }

      lastPosRef.current = { x, y };

      const currentRects = rectanglesRef.current;
      const targetRects =
        splitRadius > 0
          ? currentRects.filter((rect) => {
              if (rect.width <= 0 || rect.height <= 0) {
                return false;
              }

              return distanceToRectangle(x, y, rect) <= splitRadius;
            })
          : currentRects.filter(
              (rect) =>
                x >= rect.x &&
                x <= rect.x + rect.width &&
                y >= rect.y &&
                y <= rect.y + rect.height
            );

      if (!targetRects.length) {
        return;
      }

      const targetSet = new Set(targetRects);
      const nextRects = currentRects.filter((rect) => !targetSet.has(rect));

      for (const rect of targetRects) {
        nextRects.push(...splitRectangle(rect, canvasDimensions.width, canvasDimensions.height));
      }

      rectanglesRef.current = nextRects;

      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        onInteractionStart?.();
      }

      scheduleRender();
    },
    [
      canvasDimensions.height,
      canvasDimensions.width,
      isLoaded,
      minSplitDistance,
      onInteractionStart,
      scheduleRender,
      splitRadius,
      splitRectangle,
    ]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      pointerDownRef.current = true;

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail on some browsers/input transitions.
      }

      revealAtPoint(event.clientX, event.clientY);
    },
    [revealAtPoint]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (event.pointerType !== 'mouse' && !pointerDownRef.current) {
        return;
      }

      revealAtPoint(event.clientX, event.clientY);
    },
    [revealAtPoint]
  );

  const handlePointerEnd = useCallback(() => {
    pointerDownRef.current = false;
    lastPosRef.current = null;
  }, []);

  return (
    <div
      className={className}
      role="img"
      aria-label="Benjamin Little headshot"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
        overflow: 'hidden',
        borderRadius: `${borderRadius}px`,
        backgroundColor: '#080808',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("${imageSrc}")`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        className="absolute inset-0 h-full w-full"
        style={{
          display: 'block',
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
