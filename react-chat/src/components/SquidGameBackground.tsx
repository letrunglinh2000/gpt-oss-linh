import React from 'react';

// Simple CSS-based Squid Game background
const SquidGameBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: -10 }}>
      {/* Squid Game inspired gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, #ff2d7a22 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #17c3e222 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, #ff2d7a11 0%, transparent 50%),
            linear-gradient(135deg, #0b0d10 0%, #1a1d23 50%, #0b0d10 100%)
          `
        }}
      />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pink shapes */}
        <div 
          className="absolute w-16 h-16 rotate-45"
          style={{
            top: '10%',
            left: '15%',
            background: 'linear-gradient(45deg, #ff2d7a44, #ff2d7a22)',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute w-12 h-12 rotate-45"
          style={{
            top: '60%',
            right: '20%',
            background: 'linear-gradient(45deg, #ff2d7a33, #ff2d7a11)',
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute w-8 h-8 rotate-45"
          style={{
            bottom: '20%',
            left: '70%',
            background: 'linear-gradient(45deg, #ff2d7a55, #ff2d7a33)',
            animation: 'float 7s ease-in-out infinite',
            animationDelay: '4s'
          }}
        />
        
        {/* Teal shapes */}
        <div 
          className="absolute w-14 h-14 rounded-full"
          style={{
            top: '30%',
            right: '30%',
            background: 'radial-gradient(circle, #17c3e244, #17c3e222)',
            animation: 'float 9s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-10 h-10 rounded-full"
          style={{
            bottom: '40%',
            left: '25%',
            background: 'radial-gradient(circle, #17c3e233, #17c3e211)',
            animation: 'float 5s ease-in-out infinite',
            animationDelay: '3s'
          }}
        />
        <div 
          className="absolute w-6 h-6 rounded-full"
          style={{
            top: '70%',
            left: '60%',
            background: 'radial-gradient(circle, #17c3e255, #17c3e233)',
            animation: 'float 10s ease-in-out infinite',
            animationDelay: '5s'
          }}
        />
        
        {/* Triangle shapes */}
        <div 
          className="absolute"
          style={{
            top: '45%',
            left: '10%',
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderBottom: '25px solid #ff2d7a33',
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '1.5s'
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '30%',
            right: '15%',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '20px solid #17c3e233',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '3.5s'
          }}
        />
      </div>
      
      {/* Add floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default SquidGameBackground;
