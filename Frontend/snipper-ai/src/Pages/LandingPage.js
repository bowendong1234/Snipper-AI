import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 30 + 2,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2 - 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: `rgba(255, 215, 0, ${Math.random() * 0.5 + 0.1})`
      });
    }
    
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Move particles
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.closePath();
      });
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleGetStarted = () => {
    navigate('/app'); // Navigate to your app page
  };
  
  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="bokeh-background"></canvas>
      <div className="content">
        <h1>Welcome to Snipper AI</h1>
        <p className="description">
        SnipperAI is your online editing assistant that turns raw footage into engaging, 
        fast-paced content! Designed for vloggers and short-form creators, SnipperAI 
        analyses your videos, trims the dull moments, and seamlessly stitches the best parts together. 
        No more tedious cutting, just instant, high-energy edits that keep your audience hooked!
        </p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;