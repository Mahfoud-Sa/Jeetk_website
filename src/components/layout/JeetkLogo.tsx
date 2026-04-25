export const JeetkLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Speed Trail / Liquid Effect */}
    <circle cx="20" cy="50" r="6" fill="#F27D26" />
    <circle cx="28" cy="40" r="4" fill="#F27D26" />
    <circle cx="28" cy="60" r="5" fill="#F27D26" />
    <path 
      d="M20 50C20 50 35 35 50 35V65C35 65 20 50 20 50Z" 
      fill="#F27D26" 
    />
    
    {/* 3D Box / Package */}
    <path 
      d="M45 40L75 25L95 40L65 55L45 40Z" 
      fill="#FFB366" 
    /> {/* Top Face */}
    <path 
      d="M45 40L65 55V85L45 70V40Z" 
      fill="#E67E22" 
    /> {/* Left Face */}
    <path 
      d="M65 55L95 40V70L65 85V55Z" 
      fill="#F39C12" 
    /> {/* Right Face */}
    
    {/* Brand Stripe (The 'J' or 'I' shape) */}
    <path 
      d="M72 38L82 33V63L72 68V38Z" 
      fill="white" 
      fillOpacity="0.9"
    />
  </svg>
);
