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
  const base = "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50 select-none shrink-0";

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
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-6 text-sm font-semibold",
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
  const base = "inline-flex items-center transition-all justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none select-none border-0";

  const variants = {
    default: "bg-white/10 hover:bg-white/20 text-brand dark:text-teal-300 hover:scale-[1.03] active:scale-[0.98] duration-200",
    primary: "bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white shadow-md hover:scale-[1.03] active:scale-[0.98]",
    destructive: "bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:scale-[1.03] active:scale-[0.98]",
    outline: "border border-white/40 bg-white/20 text-ink hover:bg-white/30 backdrop-blur-md",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 backdrop-blur-md",
    ghost: "hover:bg-white/15 text-inherit",
    link: "text-brand underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2 text-xs font-bold",
    sm: "h-8 text-xs gap-1.5 px-3.5 font-bold",
    lg: "h-10 px-5 text-sm font-bold",
    xl: "h-12 px-7 text-sm font-bold",
    xxl: "h-14 px-9 text-base font-extrabold",
    icon: "h-9 w-9 p-0 flex items-center justify-center",
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
        "relative overflow-hidden group isolate rounded-full border-0",
        liquidbuttonVariants({ variant, size, className })
      )}
      {...props}
    >
      {/* Subtle Specular Top Sheen */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none 
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] 
          transition-all duration-300" 
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

// --- Metal 3D Tactile Button (Pill Shape) ---
const colorVariants = {
  default: {
    outer: "bg-gradient-to-b from-zinc-700 to-zinc-900",
    inner: "bg-gradient-to-b from-zinc-200 via-zinc-600 to-zinc-800",
    button: "bg-gradient-to-b from-zinc-800 to-zinc-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-teal-500 to-cyan-800",
    inner: "bg-gradient-to-b from-teal-200 via-teal-600 to-cyan-900",
    button: "bg-gradient-to-b from-teal-700 to-slate-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
  success: {
    outer: "bg-gradient-to-b from-emerald-500 to-teal-800",
    inner: "bg-gradient-to-b from-emerald-200 via-emerald-600 to-teal-900",
    button: "bg-gradient-to-b from-emerald-700 to-teal-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
  error: {
    outer: "bg-gradient-to-b from-rose-500 to-red-800",
    inner: "bg-gradient-to-b from-rose-200 via-rose-600 to-red-900",
    button: "bg-gradient-to-b from-rose-700 to-red-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-amber-400 to-amber-700",
    inner: "bg-gradient-to-b from-amber-100 via-amber-500 to-amber-800",
    button: "bg-gradient-to-b from-amber-600 to-amber-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-orange-400 to-orange-800",
    inner: "bg-gradient-to-b from-orange-100 via-orange-500 to-orange-900",
    button: "bg-gradient-to-b from-orange-700 to-orange-950",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]",
  },
};

const ShineEffect = ({ isPressed }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300 rounded-full",
        isPressed ? "opacity-30" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
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
    sm: "h-8 px-4 text-xs font-bold",
    default: "h-9 px-5 text-xs font-bold",
    lg: "h-11 px-7 text-sm font-bold",
  };

  const wrapperStyle = {
    transform: isPressed ? "translateY(1.5px) scale(0.99)" : "translateY(0) scale(1)",
    boxShadow: isPressed
      ? "0 1px 2px rgba(0, 0, 0, 0.15)"
      : isHovered && !isTouchDevice
      ? "0 4px 12px rgba(0, 0, 0, 0.18)"
      : "0 2px 6px rgba(0, 0, 0, 0.10)",
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
        "relative inline-flex transform-gpu rounded-full p-[1.5px] will-change-transform select-none cursor-pointer",
        colors.outer
      )}
      style={wrapperStyle}
    >
      <div className={cn("absolute inset-[1px] transform-gpu rounded-full will-change-transform", colors.inner)} style={innerStyle} />
      <button
        ref={ref}
        className={cn(
          "relative z-10 m-[1px] rounded-full inline-flex transform-gpu cursor-pointer items-center justify-center gap-1.5 overflow-hidden font-sans uppercase tracking-wider will-change-transform outline-none border-0 text-white font-bold",
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t rounded-full from-transparent to-white/10" />
        )}
      </button>
    </div>
  );
});
MetalButton.displayName = "MetalButton";
