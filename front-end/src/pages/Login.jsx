import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import api from '../api/axios';
import Theme from '../components/dark.mode';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) setError('Email ou mot de passe incorrect.');
        else if (status === 400) setError(data?.message || 'Données invalides.');
        else if (status >= 500) setError('Erreur serveur. Réessayez plus tard.');
        else setError(data?.message || 'Impossible de se connecter.');
      } else if (err.request) {
        setError('Impossible de contacter le serveur.');
      } else {
        setError('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">

      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 md:min-h-[580px]">

        {/* PANEL GAUCHE : Branding (Masqué sur mobile avec 'hidden md:flex') */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 p-10 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <Link to="/">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <span className="font-bold text-lg tracking-wide text-white">
                Alovako
              </span>
            </div>
          </Link>

          <div className="my-8 relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white mb-3">
              Gérez votre croissance.
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              Suivez vos revenus, maîtrisez vos dépenses et visualisez votre trésorerie en temps réel.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
              ✓
            </div>
            <div className="text-xs">
              <div className="font-semibold text-white">Dashboard Synchronisé</div>
              <div className="text-[10px] text-purple-200/70">Mise à jour instantanée</div>
            </div>
          </div>
        </div>

        {/* PANEL DROIT : Formulaire de connexion (Complet mais épuré sur mobile) */}
        <div className="md:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white dark:bg-gray-900 relative">

          {/* Header Mobile Uniquement (Masqué sur Desktop) */}
          <div className="flex md:hidden items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20">
                F
              </div>
              <span className="font-bold text-base text-gray-900 dark:text-white tracking-wide">
                Alovako
              </span>
            </Link>
            <Theme />
          </div>

          {/* Bouton Thème sur Desktop uniquement */}
          <div className="hidden md:block absolute top-6 right-6">
            <Theme />
          </div>

          <div className="max-w-sm w-full mx-auto">

            {/* Titre Formulaire */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bon retour 👋
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Entrez vos identifiants pour accéder à votre espace
              </p>
            </div>

            {/* Messages Flash */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                <span>✓</span> {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-rose-500 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-11 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.163c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-purple-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
              Pas encore de compte ?{' '}
              <Link
                to="/signup"
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors"
              >
                Souscrire
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;