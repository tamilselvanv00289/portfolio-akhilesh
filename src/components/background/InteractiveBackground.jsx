import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * InteractiveBackground:
 * - Changes dynamic ambient background glow / color based on cursor coordinates.
 * - Spawns a floating particle constellation that actively reacts to cursor movement:
 *   - Particles repel and scatter away when cursor approaches.
 *   - Connecting constellation lines between nearby particles and the cursor.
 *   - Smooth cursor spotlight glow with dynamic hue interpolation.
 */
function InteractiveBackground({ isDarkMode }) {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with lerp for buttery smooth transitions
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 170,
      active: false,
      speed: 0,
      lastX: width / 2,
      lastY: height / 2,
    };

    // Responsive particle count
    const getParticleCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(110, Math.max(50, Math.floor(area / 15000)));
    };

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * width : Math.random() < 0.5 ? 0 : width;
        this.y = initial ? Math.random() * height : Math.random() * height;
        this.baseRadius = Math.random() * 2.2 + 1.2;
        this.radius = this.baseRadius;
        this.baseSpeed = Math.random() * 0.45 + 0.2;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.baseSpeed;
        this.vy = Math.sin(angle) * this.baseSpeed;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }

      update(currentHue) {
        this.pulse += this.pulseSpeed;

        // Mouse interaction (repulsion & excitement)
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const repelStrength = 4.0 * force;
            this.vx += Math.cos(angle) * repelStrength;
            this.vy += Math.sin(angle) * repelStrength;
            this.radius = this.baseRadius + force * 2.8;
          } else {
            this.radius += (this.baseRadius - this.radius) * 0.05;
          }
        } else {
          this.radius += (this.baseRadius - this.radius) * 0.05;
        }

        // Apply friction to return smoothly to natural ambient drift
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Keep a minimum gentle drift
        const currentSpeed = Math.hypot(this.vx, this.vy);
        if (currentSpeed < this.baseSpeed) {
          this.vx += (Math.cos(this.pulse) * this.baseSpeed * 0.2);
          this.vy += (Math.sin(this.pulse) * this.baseSpeed * 0.2);
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around borders
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;

        this.hue = currentHue;
      }

      draw() {
        const opacity = isDarkMode ? 0.7 : 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode
          ? `hsla(${this.hue}, 85%, 70%, ${opacity})`
          : `hsla(${this.hue}, 70%, 45%, ${opacity * 0.8})`;
        ctx.shadowBlur = isDarkMode ? 8 : 0;
        ctx.shadowColor = `hsla(${this.hue}, 90%, 65%, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let particles = Array.from({ length: getParticleCount() }, () => new Particle());

    // Window resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = Array.from({ length: getParticleCount() }, () => new Particle());
    };

    // Mouse movement handler
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Calculate cursor velocity
      const dX = e.clientX - mouse.lastX;
      const dY = e.clientY - mouse.lastY;
      mouse.speed = Math.hypot(dX, dY);
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let currentHue = 160;

    const render = () => {
      // Smooth lerp mouse towards target
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Dynamic Hue Calculation based on cursor position across screen: Emerald -> Mint -> Cyan -> Aqua
      const normX = Math.min(1, Math.max(0, mouse.x / width));
      const normY = Math.min(1, Math.max(0, mouse.y / height));
      const targetHue = 155 + (normX * 45) + (normY * 30);
      currentHue += (targetHue - currentHue) * 0.08;

      // Update background ambient glow element smoothly
      if (glowRef.current) {
        const glowOpacity1 = isDarkMode ? 0.25 : 0.16;
        const glowOpacity2 = isDarkMode ? 0.14 : 0.09;
        const color1 = `hsla(${currentHue}, 85%, ${isDarkMode ? '60%' : '50%'}, ${glowOpacity1})`;
        const color2 = `hsla(${(currentHue + 40) % 360}, 80%, ${isDarkMode ? '55%' : '45%'}, ${glowOpacity2})`;
        const ambientColor = `hsla(${(currentHue + 180) % 360}, 70%, ${isDarkMode ? '45%' : '65%'}, ${isDarkMode ? 0.09 : 0.05})`;

        glowRef.current.style.background = `
          radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, ${color1} 0%, ${color2} 40%, transparent 75%),
          radial-gradient(850px circle at ${width - mouse.x * 0.35}px ${height - mouse.y * 0.35}px, ${ambientColor} 0%, transparent 65%)
        `;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw constellation links between nearby particles
      const maxDistance = 115;
      for (let i = 0; i < particles.length; i += 1) {
        particles[i].update(currentHue);
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDarkMode ? 0.24 : 0.15);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDarkMode
              ? `hsla(${currentHue}, 80%, 75%, ${alpha})`
              : `hsla(${currentHue}, 60%, 45%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw interactive connection line between cursor and nearby particles
        if (mouse.active) {
          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < mouse.radius) {
            const mAlpha = (1 - mDist / mouse.radius) * (isDarkMode ? 0.45 : 0.28);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isDarkMode
              ? `hsla(${currentHue + 20}, 95%, 70%, ${mAlpha})`
              : `hsla(${currentHue}, 75%, 45%, ${mAlpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
      }

      // Draw subtle glowing nucleus at the cursor
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode ? `hsla(${currentHue}, 90%, 75%, 0.95)` : `hsla(${currentHue}, 75%, 50%, 0.75)`;
        ctx.shadowBlur = isDarkMode ? 12 : 6;
        ctx.shadowColor = `hsla(${currentHue}, 90%, 75%, 1)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDarkMode]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Dynamic ambient color glow shifting with cursor */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transition: 'background 0.15s ease-out',
          willChange: 'background',
        }}
      />
      {/* Particle constellation canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

InteractiveBackground.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
};

export default InteractiveBackground;
