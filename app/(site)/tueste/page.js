import '@/styles/tueste.css';

export const metadata = {
    title: 'Tueste | Brew & Co.',
};

export default function TuestePage() {
    return (
        <main className="page">
            <div className="page-heading">
                <span className="eyebrow">BREW & CO.</span>
                <h1>El Proceso de Tueste</h1>
            </div>
            <p style={{ color: 'var(--muted-color)', maxWidth: '500px', textAlign: 'center' }}>
                Del grano verde a la taza perfecta.
            </p>
        </main>
    );
}
