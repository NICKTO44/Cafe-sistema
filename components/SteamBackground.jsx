'use client';

import { useEffect, useRef } from 'react';

export default function SteamBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        function createSteam() {
            const puff = document.createElement('div');
            puff.className = 'steam-puff';
            const size = Math.random() * 26 + 14;
            puff.style.width = size + 'px';
            puff.style.height = size + 'px';
            puff.style.left = Math.random() * 100 + '%';
            puff.style.bottom = '-40px';

            const duration = Math.random() * 6 + 5;
            puff.style.animation = `floatUpSteam ${duration}s linear forwards`;

            container.appendChild(puff);
            setTimeout(() => puff.remove(), duration * 1000);
        }

        const interval = setInterval(createSteam, 450);
        return () => clearInterval(interval);
    }, []);

    return <div id="steam-container" ref={containerRef}></div>;
}
