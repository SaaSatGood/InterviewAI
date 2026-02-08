import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-40 disabled:pointer-events-none";

    const variants = {
        primary: "bg-white text-neutral-900 hover:bg-neutral-100 focus:ring-white/50",
        secondary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus:ring-neutral-500 border border-neutral-700",
        outline: "border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800/50 hover:text-neutral-100",
        ghost: "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50",
        danger: "bg-red-600/90 text-white hover:bg-red-600 focus:ring-red-500",
    };

    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
}
