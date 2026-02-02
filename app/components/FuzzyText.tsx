'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  onHoverChange?: (isHovering: boolean) => void;
}

interface OffscreenCanvasData {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  textBoundingWidth: number;
  tightHeight: number;
  xOffset: number;
  actualAscent: number;
}

const FuzzyText: React.FC<FuzzyTextProps> = ({
  children,
  fontSize = 'clamp(2rem, 8vw, 8rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  fontStyle = 'normal',
  color = '#fff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  onHoverChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement & { cleanupFuzzyText?: () => void }>(null);
  const offscreenDataRef = useRef<OffscreenCanvasData | null>(null);
  const [offscreenRevision, setOffscreenRevision] = useState(0);

  // Effect 1: Render text to offscreen canvas (re-runs when text or style changes)
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const computedFontFamily =
        fontFamily === 'inherit' ? window.getComputedStyle(canvas).fontFamily || 'sans-serif' : fontFamily;

      const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      let numericFontSize: number;
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement('span');
        temp.style.fontSize = fontSize;
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = parseFloat(computedSize);
        document.body.removeChild(temp);
      }

      const text = React.Children.toArray(children).join('');

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = `${fontStyle} ${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      const metrics = offCtx.measureText(text);

      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 40;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontStyle} ${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      // Store offscreen canvas data
      offscreenDataRef.current = {
        canvas: offscreen,
        width: offscreenWidth,
        height: tightHeight,
        textBoundingWidth,
        tightHeight,
        xOffset,
        actualAscent
      };

      // Increment revision to trigger animation loop restart
      setOffscreenRevision(prev => prev + 1);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [children, fontSize, fontWeight, fontFamily, fontStyle, color]);

  // Effect 2: Animation loop (re-runs when offscreen canvas or intensity changes)
  useEffect(() => {
    if (offscreenRevision === 0 || !offscreenDataRef.current) return;

    let animationFrameId: number;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreenData = offscreenDataRef.current;
    const { canvas: offscreen, width: offscreenWidth, tightHeight, textBoundingWidth, xOffset } = offscreenData;

    const horizontalMargin = 50;
    const verticalMargin = 0;
    canvas.width = offscreenWidth + horizontalMargin * 2;
    canvas.height = tightHeight + verticalMargin * 2;
    ctx.translate(horizontalMargin, verticalMargin);

    const interactiveLeft = horizontalMargin + xOffset;
    const interactiveTop = verticalMargin;
    const interactiveRight = interactiveLeft + textBoundingWidth;
    const interactiveBottom = interactiveTop + tightHeight;

    let isHovering = false;
    const fuzzRange = 30;

    const run = () => {
      if (isCancelled) return;
      ctx.clearRect(-fuzzRange, -fuzzRange, offscreenWidth + 2 * fuzzRange, tightHeight + 2 * fuzzRange);
      const intensity = isHovering ? hoverIntensity : baseIntensity;
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
        ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
      }
      animationFrameId = window.requestAnimationFrame(run);
    };

    run();

    const isInsideTextArea = (x: number, y: number) =>
      x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableHover) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const wasHovering = isHovering;
      isHovering = isInsideTextArea(x, y);
      if (wasHovering !== isHovering && onHoverChange) {
        onHoverChange(isHovering);
      }
    };

    const handleMouseLeave = () => {
      if (isHovering && onHoverChange) {
        onHoverChange(false);
      }
      isHovering = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!enableHover) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const wasHovering = isHovering;
      isHovering = isInsideTextArea(x, y);
      if (wasHovering !== isHovering && onHoverChange) {
        onHoverChange(isHovering);
      }
    };

    const handleTouchEnd = () => {
      if (isHovering && onHoverChange) {
        onHoverChange(false);
      }
      isHovering = false;
    };

    if (enableHover) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('touchmove', handleTouchMove, {
        passive: false
      });
      canvas.addEventListener('touchend', handleTouchEnd);
    }

    const cleanup = () => {
      window.cancelAnimationFrame(animationFrameId);
      if (enableHover) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };

    canvas.cleanupFuzzyText = cleanup;

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      if (canvas && canvas.cleanupFuzzyText) {
        canvas.cleanupFuzzyText();
      }
    };
  }, [offscreenRevision, enableHover, baseIntensity, hoverIntensity, onHoverChange]);

  return <canvas ref={canvasRef} style={{ pointerEvents: 'auto' }} />;
};

export default FuzzyText;
