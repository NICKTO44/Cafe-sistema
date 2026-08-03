import '@/styles/granos.css';

export const metadata = {
    title: 'Granos | Brew & Co.',
};

export default function GranosPage() {
    return (
        <main className="page">
            <div className="page-heading">
                <span className="eyebrow">BREW & CO.</span>
                <h1>Nuestros Granos</h1>
            </div>
            <p style={{ color: 'var(--muted-color)', maxWidth: '500px', textAlign: 'center' }}>
                Origen, altitud y perfil de sabor de cada lote.
            </p>
        </main>
    );
}
