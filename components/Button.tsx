import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative px-8 py-5 rounded-2xl font-bold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed outline-none flex items-center justify-center transform active:scale-[0.98]";
  
  const variants = {
    primary: `
      bg-main text-gold-500 shadow-neu 
      hover:text-gold-300 hover:shadow-glow
      active:shadow-neu-pressed
      border border-transparent
    `,
    secondary: `
      bg-main text-gray-500 shadow-neu 
      hover:text-gold-500 active:shadow-neu-pressed
    `,
    gold: `
      bg-gradient-to-r from-gold-400 to-gold-600
      text-main
      shadow-[0_10px_20px_rgba(212,175,55,0.3)]
      hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]
      hover:brightness-110
      border border-transparent
    `
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-2xl">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>{children}</span>
    </button>
  );
};