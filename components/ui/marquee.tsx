"use client";

import React, { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { FaGoogleDrive, FaDropbox, FaAws } from "react-icons/fa6";
import { TbBrandOnedrive } from "react-icons/tb";
import { SiCloudflare } from "react-icons/si";

export type Logo = {
  src?: string;
  alt: string;
  name?: string;
  icon?: React.ReactNode;
  width?: number;
  height?: number;
};

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 48,
  duration = 30,
  durationOnHover = 15,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (!size) return;

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    let controls: { stop: () => void } | undefined;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration:
          currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prev) => prev + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: currentDuration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => translation.set(from),
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentDuration,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
});

// Default Supported Cloud Storage Providers (Monochromatic)
export const DEFAULT_CLOUD_LOGOS: Logo[] = [
  {
    name: "Google Drive",
    alt: "Google Drive",
    icon: <FaGoogleDrive className="size-5" />,
  },
  {
    name: "Dropbox",
    alt: "Dropbox",
    icon: <FaDropbox className="size-5" />,
  },
  {
    name: "Microsoft OneDrive",
    alt: "OneDrive",
    icon: <TbBrandOnedrive className="size-5" />,
  },
  {
    name: "Amazon S3",
    alt: "Amazon S3",
    icon: <FaAws className="size-5" />,
  },
  {
    name: "Cloudflare R2",
    alt: "Cloudflare R2",
    icon: <SiCloudflare className="size-5" />,
  },
];

const LogoItem = memo(function LogoItem({ logo }: { logo: Logo }) {
  if (logo.src) {
    return (
      <img
        alt={logo.alt}
        src={logo.src}
        width={logo.width ?? "auto"}
        height={logo.height ?? "auto"}
        loading="lazy"
        className="pointer-events-none h-4 select-none md:h-5 grayscale opacity-60 hover:opacity-100 transition-opacity dark:brightness-0 dark:invert"
      />
    );
  }

  return (
    <div className="flex items-center gap-2.5 select-none cursor-default opacity-60 hover:opacity-100 transition-all duration-200 grayscale dark:brightness-0 dark:invert">
      {logo.icon}
      <span className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">
        {logo.name || logo.alt}
      </span>
    </div>
  );
});

export const LogoMarquee = memo(function LogoMarquee({
  logos = DEFAULT_CLOUD_LOGOS,
  className,
}: {
  logos?: Logo[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto overflow-hidden py-3.5 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={54} duration={35} durationOnHover={18}>
        {[...logos, ...logos].map((logo, i) => (
          <LogoItem key={`${logo.alt}-${i}`} logo={logo} />
        ))}
      </InfiniteSlider>
    </div>
  );
});

LogoMarquee.displayName = "LogoMarquee";
export const Marquee = InfiniteSlider;
export default LogoMarquee;
