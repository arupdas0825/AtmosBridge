import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

// --- Glass Filter for Liquid Glass Effect ---
export function GlassFilter() {
  return (
    <svg className="hidden pointer-events-none absolute w-0 h-0" aria-hidden="true">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

// --- Standard Button Variants ---
export function buttonVariants({ variant = "default", size = "default", className = "" } = {}) {
  const base = "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50 select-none shrink-0";

  const variants = {
    default: "bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    cool: "bg-gradient-to-t from-brand-dark to-brand text-white border border-brand-dark/40 shadow-md shadow-brand/20 ring-1 ring-inset ring-white/25 hover:brightness-110 active:brightness-95",
    outline: "border border-slate-200 bg-white/80 backdrop-blur-md text-ink hover:bg-slate-100 hover:text-brand",
    secondary: "bg-slate-100 text-ink hover:bg-slate-200 border border-slate-200/60",
    ghost: "hover:bg-slate-100/80 hover:text-brand text-ink-muted",
    link: "text-brand underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-6 text-sm font-semibold",
    icon: "h-9 w-9 p-0 flex items-center justify-center",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
}

export const Button = forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// --- Liquid Glass Button Variants ---
export function liquidbuttonVariants({ variant = "default", size = "default", className = "" } = {}) {
  const base = "inline-flex items-center transition-all justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none select-none";

  const variants = {
    default: "bg-white/10 hover:bg-white/20 text-brand dark:text-teal-300 hover:scale-[1.03] active:scale-[0.98] duration-200",
    primary: "bg-brand/90 hover:bg-brand text-white shadow-lg shadow-brand/25 hover:scale-[1.03] active:scale-[0.98]",
    destructive: "bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:scale-[1.03] active:scale-[0.98]",
    outline: "border border-white/40 bg-white/20 text-ink hover:bg-white/30 backdrop-blur-md",
    secondary: "bg-slate-800/80 text-white hover:bg-slate-800 backdrop-blur-md",
    ghost: "hover:bg-white/15 text-inherit",
    link: "text-brand underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2 text-xs",
    sm: "h-8 text-xs gap-1.5 px-3.5",
    lg: "h-10 rounded-full px-5 text-sm",
    xl: "h-12 rounded-full px-7 text-sm font-bold",
    xxl: "h-14 rounded-full px-9 text-base font-extrabold",
    icon: "h-9 w-9 p-0 rounded-full flex items-center justify-center",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
}

export const LiquidButton = forwardRef(({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      data-slot="button"
      className={cn(
        "relative overflow-hidden group isolate",
        liquidbuttonVariants({ variant, size, className })
      )}
      {...props}
    >
      {/* Specular Liquid Glass Edge Shadows */}
      <div 
        className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.08),inset_0_0_2px_2px_rgba(0,0,0,0.04),0_0_12px_rgba(255,255,255,0.2)] 
          transition-all duration-300 group-hover:inset-shadow-sm pointer-events-none" 
      />
      
      {/* Liquid Refraction Glass Layer */}
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full backdrop-blur-md"
        style={{ backdropFilter: 'blur(8px)' }}
      />

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>

      <GlassFilter />
    </button>
  );
});
LiquidButton.displayName = "LiquidButton";

// --- Metal 3D Tactile Button ---
const colorVariants = {
  default: {
    outer: "bg-gradient-to-b from-[#2B2B2B] to-[#71717A]",
    inner: "bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]",
    button: "bg-gradient-to-b from-[#4B5563] to-[#1F2937]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(0_0_0_/_80%)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#0F766E] to-[#14B8A6]",
    inner: "bg-gradient-to-b from-[#5EEAD4] via-[#0D9488] to-[#115E59]",
    button: "bg-gradient-to-b from-[#0D9488] to-[#042F2E]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(4_47_46_/_90%)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#005A43] to-[#7CCB9B]",
    inner: "bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]",
    button: "bg-gradient-to-b from-[#059669] to-[#064E3B]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]",
    inner: "bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]",
    button: "bg-gradient-to-b from-[#DC2626] to-[#7F1D1D]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(127_29_29_/_100%)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#917100] to-[#EAD98F]",
    inner: "bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]",
    button: "bg-gradient-to-b from-[#D97706] to-[#78350F]",
    textColor: "text-[#FFFDE5]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(120_53_15_/_100%)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#864813] to-[#E9B486]",
    inner: "bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]",
    button: "bg-gradient-to-b from-[#9A3412] to-[#431407]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(67_20_7_/_100%)]",
  },
};

const ShineEffect = ({ isPressed }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300 rounded-md",
        isPressed ? "opacity-25" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export const MetalButton = forwardRef(({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const colors = colorVariants[variant] || colorVariants.default;
  const transitionStyle = "all 200ms cubic-bezier(0.1, 0.4, 0.2, 1)";

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    default: "h-9 px-4 text-xs font-bold",
    lg: "h-11 px-6 text-sm font-bold",
  };

  const wrapperStyle = {
    transform: isPressed ? "translateY(2px) scale(0.99)" : "translateY(0) scale(1)",
    boxShadow: isPressed
      ? "0 1px 2px rgba(0, 0, 0, 0.2)"
      : isHovered && !isTouchDevice
      ? "0 4px 14px rgba(0, 0, 0, 0.22)"
      : "0 2px 8px rgba(0, 0, 0, 0.12)",
    transition: transitionStyle,
    transformOrigin: "center center",
  };

  const innerStyle = {
    transition: transitionStyle,
    transformOrigin: "center center",
    filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.08)" : "none",
  };

  const buttonStyle = {
    transform: isPressed ? "scale(0.98)" : "scale(1)",
    transition: transitionStyle,
    transformOrigin: "center center",
    filter: isHovered && !isPressed && !isTouchDevice ? "brightness(1.04)" : "none",
  };

  return (
    <div
      className={cn(
        "relative inline-flex transform-gpu rounded-lg p-[1.2px] will-change-transform select-none cursor-pointer",
        colors.outer
      )}
      style={wrapperStyle}
    >
      <div className={cn("absolute inset-[1px] transform-gpu rounded-lg will-change-transform", colors.inner)} style={innerStyle} />
      <button
        ref={ref}
        className={cn(
          "relative z-10 m-[1px] rounded-md inline-flex transform-gpu cursor-pointer items-center justify-center gap-1.5 overflow-hidden font-sans uppercase tracking-wider will-change-transform outline-none",
          colors.button,
          colors.textColor,
          colors.textShadow,
          sizeClasses[size] || sizeClasses.default,
          className
        )}
        style={buttonStyle}
        {...props}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => { setIsPressed(false); setIsHovered(false); }}
        onMouseEnter={() => { if (!isTouchDevice) setIsHovered(true); }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onTouchCancel={() => setIsPressed(false)}
      >
        <ShineEffect isPressed={isPressed} />
        {children}
        {isHovered && !isPressed && !isTouchDevice && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t rounded-md from-transparent to-white/10" />
        )}
      </button>
    </div>
  );
});
MetalButton.displayName = "MetalButton";
