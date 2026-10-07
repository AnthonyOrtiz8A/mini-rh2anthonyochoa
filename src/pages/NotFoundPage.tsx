import { Link } from 'react-router-dom';
import { usePageNotFound } from '../hooks/usePageNotFound';

function NotFoundPage() {
  const location = usePageNotFound();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-blue-600"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
            <path d="M9 9l4 4M13 9l-4 4" />
          </svg>
        </div>

        <p className="text-6xl font-extrabold text-brand-800 mb-2">404</p>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Página no encontrada</h1>
        <p className="text-slate-500 text-sm mb-1">
          No pudimos encontrar la ruta que buscas.
        </p>
        <p className="text-xs text-slate-400 font-mono bg-slate-100 rounded-md px-3 py-1.5 inline-block mb-8 max-w-full break-all">
          {location.pathname}
        </p>

        <div>
          <Link
            to="/dashboard"
            className="inline-block px-5 py-2.5 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;