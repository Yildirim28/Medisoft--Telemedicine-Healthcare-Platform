import { useEffect, useRef } from 'react';

/**
 * AnimatedPage - Wrapper component that adds entrance animations to page content.
 * Applies staggered fade-in-up animations to children.
 */
export default function AnimatedPage({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`page-enter ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * StaggerChildren - Wraps a list of items and staggers their entrance animations.
 * Pass an array of elements as children.
 */
export function StaggerChildren({ children, staggerDelay = 80, className = '' }) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className="stagger-child"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * ScrollReveal - Animates elements into view when they scroll into the viewport.
 */
export function ScrollReveal({ children, className = '', direction = 'up', delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const transformMap = {
      up: 'translateY(0)',
      down: 'translateY(0)',
      left: 'translateX(0)',
      right: 'translateX(0)',
      none: 'none',
    };

    const initialTransformMap = {
      up: 'translateY(30px)',
      down: 'translateY(-30px)',
      left: 'translateX(-30px)',
      right: 'translateX(30px)',
      none: 'none',
    };

    // Set initial state
    el.style.opacity = '0';
    el.style.transform = initialTransformMap[direction] || initialTransformMap.up;
    el.style.transition = `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = transformMap[direction] || transformMap.up;
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [direction, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * FadeIn - Simple fade-in animation triggered on mount.
 */
export function FadeIn({ children, className = '', duration = 500, delay = 0 }) {
  return (
    <div
      className={className}
      style={{
        opacity: 0,
        animation: `fadeIn ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn - Scale-up entrance animation.
 */
export function ScaleIn({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * CountUpNumber - Animates a number counting up from 0.
 */
export function CountUpNumber({ target, duration = 1500, className = '' }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const end = parseInt(target) || 0;
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            el.textContent = current;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              el.textContent = target;
            }
          }

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref} className={className}>0</span>;
}
