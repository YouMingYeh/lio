"use client";

import { cn } from "@workspace/ui/lib/utils";
import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const MOVEMENT_DAMPING = 1400;

// Blue color theme configuration
const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [41 / 255, 98 / 255, 255 / 255], // Changed to blue
  glowColor: [0.8, 0.8, 1], // Slight blue tint to glow
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
    // Taiwan
    { location: [25.0329694, 121.5654177], size: 0.1 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
  isBackground = false, // New prop to control if it's a background element
  priority = false, // Control loading priority
  fallbackImage = "/globe.png", // Fallback static image
  rotationSpeed = 0.001, // New prop to control rotation speed
}: {
  className?: string;
  config?: COBEOptions;
  isBackground?: boolean; // Specify if it should be a background element
  priority?: boolean; // Control loading priority for performance
  fallbackImage?: string; // Fallback static image URL
  rotationSpeed?: number; // Control the rotation speed
}) {
  const [isReady, setIsReady] = useState(false);
  const [hasWebGLSupport, setHasWebGLSupport] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const widthRef = useRef(0);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  // Check WebGL support
  useEffect(() => {
    // Helper function to check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        return !!gl;
      } catch (e) {
        return false;
      }
    };

    setHasWebGLSupport(checkWebGLSupport());
    setIsReady(true);

    return () => {
      setIsReady(false);
    };
  }, []);

  // Initialize the globe
  useEffect(() => {
    if (!isReady || !hasWebGLSupport) return;

    let globeInstance: ReturnType<typeof createGlobe> | undefined;
    let animationFrameId: number | undefined;
    let isMounted = true;
    let errorCount = 0;
    const MAX_RETRY_COUNT = 3;

    const initGlobeWithDelay = () => {
      if (!isMounted) return;

      try {
        initGlobe();
      } catch (error) {
        errorCount++;
        console.error(
          `Error initializing globe (attempt ${errorCount}):`,
          error,
        );

        if (errorCount < MAX_RETRY_COUNT) {
          // Retry after a delay
          setTimeout(initGlobeWithDelay, 1000);
        } else {
          // Give up and switch to fallback
          setHasWebGLSupport(false);
        }
      }
    };

    // Don't initialize if the component is being loaded in the background without priority
    if (!priority && isBackground) {
      // Delay loading for background elements
      const timer = setTimeout(initGlobeWithDelay, 1000);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      initGlobeWithDelay();
    }

    function initGlobe() {
      if (!canvasRef.current) return;

      const onResize = () => {
        if (canvasRef.current && isMounted) {
          widthRef.current = canvasRef.current.offsetWidth;
        }
      };

      window.addEventListener("resize", onResize);
      onResize();

      try {
        globeInstance = createGlobe(canvasRef.current, {
          ...config,
          width: widthRef.current * 2,
          height: widthRef.current * 2,
          onRender: (state) => {
            // Slower rotation for background elements to reduce CPU usage
            if (!pointerInteracting.current) {
              phiRef.current += isBackground
                ? rotationSpeed
                : rotationSpeed * 5; // Adjust rotation speed
            }
            state.phi = phiRef.current + rs.get();
            state.width = widthRef.current * 2;
            state.height = widthRef.current * 2;
          },
        });

        // Fade in
        if (isMounted && canvasRef.current) {
          animationFrameId = requestAnimationFrame(() => {
            if (canvasRef.current) {
              canvasRef.current.style.opacity = "1";
            }
          });
        }
      } catch (error) {
        console.error("Failed to create globe:", error);
        setHasWebGLSupport(false);
      }

      return () => {
        isMounted = false;
        window.removeEventListener("resize", onResize);

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        if (globeInstance) {
          try {
            globeInstance.destroy();
          } catch (error) {
            console.error("Error destroying globe:", error);
          }
        }
      };
    }
  }, [
    rs,
    config,
    isBackground,
    priority,
    isReady,
    hasWebGLSupport,
    rotationSpeed,
  ]);

  // Render fallback image if WebGL is not supported
  if (!hasWebGLSupport) {
    return (
      <div
        className={cn(
          "mx-auto aspect-[1/1] w-full max-w-[600px] relative",
          isBackground ? "pointer-events-none absolute inset-0 -z-10" : "",
          className,
        )}
      >
        <img
          src={fallbackImage}
          alt="Globe Visualization"
          className="w-full h-full object-contain opacity-70"
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto aspect-[1/1] w-full max-w-[600px]",
        isBackground ? "pointer-events-none absolute inset-0 -z-10" : "",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
          isBackground ? "pointer-events-none" : "",
        )}
        ref={canvasRef}
        onPointerDown={
          isBackground
            ? undefined
            : (e) => {
                pointerInteracting.current = e.clientX;
                updatePointerInteraction(e.clientX);
              }
        }
        onPointerUp={
          isBackground ? undefined : () => updatePointerInteraction(null)
        }
        onPointerOut={
          isBackground ? undefined : () => updatePointerInteraction(null)
        }
        onMouseMove={
          isBackground ? undefined : (e) => updateMovement(e.clientX)
        }
        onTouchMove={
          isBackground
            ? undefined
            : (e) => e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
