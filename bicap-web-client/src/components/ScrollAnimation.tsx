'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export default function ScrollAnimation({ 
    children, 
    className = '', 
    delay = 0,
    direction = 'up' 
}: ScrollAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay]);

    const directionClasses = {
        up: 'translate-y-8',
        down: '-translate-y-8',
        left: 'translate-x-8',
        right: '-translate-x-8',
        fade: ''
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                isVisible
                    ? 'opacity-100 translate-y-0 translate-x-0'
                    : `opacity-0 ${directionClasses[direction]}`
            } ${className}`}
        >
            {children}
        </div>
    );
}
