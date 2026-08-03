'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCurrency } from './CurrencyProvider';

const CUP_IMAGES = {
    espresso: '/assets/images/espresso.webp',
    latte: '/assets/images/latte.webp',
};

export default function HeroInteractive() {
    const { format } = useCurrency();
    const rootRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || typeof window === 'undefined' || !window.gsap) return;
        const gsap = window.gsap;

        const cup = root.querySelector('#product-cup');
        const specksFG = root.querySelector('.specks-container');
        const specksBG = root.querySelector('.specks-container-bg');
        const wispsBG = root.querySelector('.wisps-container');
        const allSpecks = root.querySelectorAll('.speck');
        const cards = root.querySelectorAll('.card');
        const heroCenter = root.querySelector('.hero-center');

        let isSwitching = false;
        let switchSpin = 0;
        let currentFlavor = 'espresso';
        let rafId;

        function updateCupFilter(blur) {
            cup.style.filter = `drop-shadow(0 30px 45px rgba(0,0,0,0.45)) blur(${blur}px)`;
        }

        function switchFlavor(flavor) {
            isSwitching = true;
            currentFlavor = flavor;
            const body = document.body;
            const specks = root.querySelectorAll('.speck');

            const targetColors =
                flavor === 'latte'
                    ? { inner: '#a9765a', mid: '#5c3a24', outer: '#1c120a' }
                    : { inner: '#6f4e37', mid: '#3c2415', outer: '#140c07' };

            gsap.to(body, {
                '--bg-inner': targetColors.inner,
                '--bg-mid': targetColors.mid,
                '--bg-outer': targetColors.outer,
                duration: 1.5,
                ease: 'power2.inOut',
            });

            const spinObj = { val: 0, blur: 0 };
            gsap.to(spinObj, {
                val: 360,
                blur: 12,
                duration: 0.6,
                ease: 'power2.in',
                onUpdate: () => {
                    switchSpin = spinObj.val;
                    updateCupFilter(spinObj.blur);
                },
                onComplete: () => {
                    cup.src = CUP_IMAGES[flavor];
                    if (flavor === 'latte') {
                        body.classList.add('latte-theme');
                    } else {
                        body.classList.remove('latte-theme');
                    }
                    gsap.to(spinObj, {
                        val: 720,
                        blur: 0,
                        duration: 1.5,
                        ease: 'back.out(0.7)',
                        onUpdate: () => {
                            switchSpin = spinObj.val;
                            updateCupFilter(spinObj.blur);
                        },
                        onComplete: () => {
                            switchSpin = 0;
                            updateCupFilter(0);
                        },
                    });
                },
            });

            let completed = 0;
            specks.forEach((speck) => {
                const sW = speck.offsetWidth / 2;
                const sH = speck.offsetHeight / 2;
                const centerX = window.innerWidth / 2 - speck.offsetLeft - sW;
                const centerY = window.innerHeight / 2 - speck.offsetTop - sH;

                const startAngle = parseFloat(speck.dataset.angle) || 0;
                const currentBaseX = parseFloat(speck.dataset.baseX) || 0;
                const currentBaseY = parseFloat(speck.dataset.baseY) || 0;

                const nextBaseX = (Math.random() - 0.5) * 160;
                const nextBaseY = (Math.random() - 0.5) * 160;

                gsap.set(speck, { rotation: startAngle, x: currentBaseX, y: currentBaseY });

                const tl = gsap.timeline();
                tl.to(speck, {
                    x: centerX,
                    y: centerY,
                    scale: 0.1,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.in',
                    onComplete: () => {
                        heroCenter.style.zIndex = 50;
                    },
                })
                    .to(speck, { duration: 0.3 })
                    .to(speck, {
                        onStart: () => {
                            heroCenter.style.zIndex = 1;
                        },
                        x: nextBaseX,
                        y: nextBaseY,
                        rotation: startAngle + 90,
                        scale: 1,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'back.out(1.5)',
                        onComplete: () => {
                            speck.dataset.angle = startAngle + 90;
                            speck.dataset.baseX = nextBaseX;
                            speck.dataset.baseY = nextBaseY;
                            speck.dataset.rx = 0;
                            speck.dataset.ry = 0;
                            completed++;
                            if (completed === specks.length) isSwitching = false;
                        },
                    });
            });
        }

        function handleCardClick(card) {
            if (isSwitching) return;
            if (card.dataset.flavor === currentFlavor) return;
            cards.forEach((c) => c.classList.remove('active'));
            card.classList.add('active');
            switchFlavor(card.dataset.flavor);
        }

        const cardHandlers = [];
        cards.forEach((card) => {
            const handler = () => handleCardClick(card);
            card.addEventListener('click', handler);
            cardHandlers.push([card, handler]);
        });

        allSpecks.forEach((s) => {
            s.dataset.rx = 0;
            s.dataset.ry = 0;
            s.dataset.angle = Math.random() * 360;
            s.dataset.baseX = 0;
            s.dataset.baseY = 0;
        });

        let mouse = { x: 0, y: 0, px: 0, py: 0 };
        let currentMouse = { x: 0, y: 0 };

        function handleMouseMove(e) {
            mouse.x = e.clientX / window.innerWidth - 0.5;
            mouse.y = e.clientY / window.innerHeight - 0.5;
            mouse.px = e.clientX;
            mouse.py = e.clientY;
        }
        window.addEventListener('mousemove', handleMouseMove);

        function animate() {
            const time = Date.now() * 0.001;
            currentMouse.x += (mouse.x - currentMouse.x) * 0.05;
            currentMouse.y += (mouse.y - currentMouse.y) * 0.05;

            const tiltY = currentMouse.x * 26;
            const tiltX = -currentMouse.y * 16;
            cup.style.transform = `translate(-50%, -50%) perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${-6 + switchSpin}deg)`;

            specksFG.style.transform = `translate(${currentMouse.x * 60}px, ${currentMouse.y * 60}px)`;
            specksBG.style.transform = `translate(${currentMouse.x * -30}px, ${currentMouse.y * -30}px)`;
            wispsBG.style.transform = `translate(${currentMouse.x * -15}px, ${currentMouse.y * -15}px)`;

            if (!isSwitching) {
                allSpecks.forEach((speck, i) => {
                    const rect = speck.getBoundingClientRect();
                    const speckX = rect.left + rect.width / 2;
                    const speckY = rect.top + rect.height / 2;

                    const diffX = mouse.px - speckX;
                    const diffY = mouse.py - speckY;
                    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

                    let targetRx = 0,
                        targetRy = 0,
                        speedMult = 1;
                    if (distance < 380) {
                        const force = (380 - distance) / 380;
                        targetRx = (diffX / distance) * force * -75;
                        targetRy = (diffY / distance) * force * -75;
                        speedMult = 1 + force * 5;
                    }

                    let rx = parseFloat(speck.dataset.rx) || 0;
                    let ry = parseFloat(speck.dataset.ry) || 0;
                    let angle = parseFloat(speck.dataset.angle) || 0;
                    let baseX = parseFloat(speck.dataset.baseX) || 0;
                    let baseY = parseFloat(speck.dataset.baseY) || 0;

                    rx += (targetRx - rx) * 0.1;
                    ry += (targetRy - ry) * 0.1;
                    angle += 0.15 * speedMult;

                    speck.dataset.rx = rx;
                    speck.dataset.ry = ry;
                    speck.dataset.angle = angle;

                    const dur = [5, 7, 6, 8, 5.5, 6.5, 9][i % 7];
                    const phase = (time + i * 0.7) * ((Math.PI * 2) / dur);
                    const floatY = Math.sin(phase) * 14;

                    speck.style.transform = `translate(calc(${rx + baseX}px), calc(${ry + baseY}px + ${floatY}px))`;
                });
            }

            root.querySelectorAll('.wisp').forEach((wisp, i) => {
                const dur = 12 + i * 2;
                const phase = (time + i * 1.2) * ((Math.PI * 2) / dur);
                const floatY = Math.sin(phase) * 18;
                const floatX = Math.cos(phase * 0.5) * 12;
                wisp.style.transform = `translate(${floatX}px, ${floatY}px)`;
            });

            rafId = requestAnimationFrame(animate);
        }
        rafId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            cardHandlers.forEach(([card, handler]) => card.removeEventListener('click', handler));
            document.body.classList.remove('latte-theme');
        };
    }, []);

    return (
        <main className="hero" ref={rootRef}>
            <div className="hero-content">
                <div className="wisps-container">
                    <div className="wisp w1">
                        <svg viewBox="0 0 60 60">
                            <use href="#wisp-shape"></use>
                        </svg>
                    </div>
                    <div className="wisp w2">
                        <svg viewBox="0 0 60 60">
                            <use href="#wisp-shape"></use>
                        </svg>
                    </div>
                    <div className="wisp w3">
                        <svg viewBox="0 0 60 60">
                            <use href="#wisp-shape"></use>
                        </svg>
                    </div>
                    <div className="wisp w4">
                        <svg viewBox="0 0 60 60">
                            <use href="#wisp-shape"></use>
                        </svg>
                    </div>
                </div>

                <div className="hero-left">
                    <h1 className="main-title">
                        <span className="outline">Rich</span>
                        <br />
                        Roast
                    </h1>
                    <p className="description">
                        Granos de tueste lento, molidos al momento. <br />
                        Cada taza servida con calma — <br />
                        calidez en cada sorbo, del grano a la taza.
                    </p>
                    <div className="cta-group">
                          <Link href="/menu" className="primary-btn">
                            Ordenar Ahora
                            <span className="plus-icon">+</span>
                        </Link>
                    </div>
                    
                </div>

                <div className="specks-container-bg">
                    <div className="speck sbg1"></div>
                    <div className="speck sbg2"></div>
                    <div className="speck sbg3"></div>
                </div>

                <div className="hero-center">
                    <div className="cup-glow"></div>
                    <img id="product-cup" className="main-product-img" src="/assets/images/espresso.webp" alt="Taza de café" />
                </div>

                <div className="specks-container">
                    <div className="speck s1"></div>
                    <div className="speck s2"></div>
                    <div className="speck s3"></div>
                    <div className="speck s4"></div>
                    <div className="speck s5"></div>
                    <div className="speck s6"></div>
                </div>

                <div className="hero-right">
                    <div className="product-carousel">
                        <div className="carousel-cards">
                            <div className="card active" data-flavor="espresso">
                                <div className="card-glow"></div>
                                <img src="/assets/images/espresso.webp" alt="Espresso Clásico" />
                                <div className="card-info">
                                    <span>Espresso Clásico</span>
                                    <span>{format(4.5)}</span>
                                </div>
                            </div>
                            <div className="card" data-flavor="latte">
                                <div className="card-glow"></div>
                                <img src="/assets/images/latte.webp" alt="Latte de Caramelo" />
                                <div className="card-info">
                                    <span>Latte de Caramelo</span>
                                    <span>{format(5.5)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-nav">
                            <button className="nav-arrow">←</button>
                            <button className="nav-arrow">→</button>
                        </div>
                    </div>
                    <h2 className="side-title">
                        <span className="outline">Recién</span>
                        <br />
                        Tostado
                    </h2>
                </div>
            </div>

            <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                <symbol id="wisp-shape" viewBox="0 0 60 60">
                    <path
                        d="M8 52 C 8 30, 52 30, 52 8"
                        stroke="white"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.5"
                    />
                </symbol>
            </svg>
        </main>
    );
}
