'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import '@/styles/admin.css';

export default function QrPage() {
    const [start, setStart] = useState(1);
    const [end, setEnd] = useState(10);
    const [generated, setGenerated] = useState([]);
    const [baseUrl, setBaseUrl] = useState('');
    const canvasRefs = useRef({});

    function handleGenerate(e) {
        e.preventDefault();
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setBaseUrl(origin);

        const tables = [];
        for (let i = start; i <= end; i++) {
            tables.push(i);
        }
        setGenerated(tables);
    }

    function handleDownload(tableNumber) {
        const canvas = canvasRefs.current[tableNumber];
        if (!canvas) return;

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mesa-' + tableNumber + '.png';
        link.click();
    }

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Codigos QR por mesa</h1>
                    <span className="admin-live-dot">
                        <span className="dot"></span>
                        {generated.length} generados
                    </span>
                </div>
                <Link href="/admin" className="admin-logout-btn">
                    Volver a pedidos
                </Link>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ color: 'var(--muted-color)', fontSize: '0.85rem' }}>
                    Desde mesa
                    <input
                        type="number"
                        min="1"
                        className="order-status-select"
                        style={{ width: '90px', marginLeft: '0.5rem' }}
                        value={start}
                        onChange={(e) => setStart(Number(e.target.value))}
                    />
                </label>
                <label style={{ color: 'var(--muted-color)', fontSize: '0.85rem' }}>
                    Hasta mesa
                    <input
                        type="number"
                        min="1"
                        className="order-status-select"
                        style={{ width: '90px', marginLeft: '0.5rem' }}
                        value={end}
                        onChange={(e) => setEnd(Number(e.target.value))}
                    />
                </label>
                <button className="admin-filter-btn active" type="submit">
                    Generar codigos QR
                </button>
            </form>

            {generated.length > 0 && (
                <div className="orders-grid">
                    {generated.map((tableNumber) => {
                        const url = baseUrl + '/menu?mesa=' + tableNumber;
                        return (
                            <div className="order-card" key={tableNumber} style={{ textAlign: 'center' }}>
                                <div className="order-card-customer" style={{ marginBottom: '1rem' }}>
                                    Mesa {tableNumber}
                                </div>

                                <div
                                    style={{
                                        background: 'white',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        display: 'inline-block',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    <QRCodeCanvas
                                        value={url}
                                        size={180}
                                        level="M"
                                        ref={(el) => {
                                            if (el) canvasRefs.current[tableNumber] = el;
                                        }}
                                    />
                                </div>

                                <p style={{ fontSize: '0.68rem', color: 'var(--muted-color)', wordBreak: 'break-all', marginBottom: '1rem' }}>
                                    {url}
                                </p>

                                <button
                                    className="admin-filter-btn"
                                    style={{ width: '100%' }}
                                    onClick={() => handleDownload(tableNumber)}
                                >
                                    Descargar PNG
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
