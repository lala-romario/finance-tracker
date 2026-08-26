import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans relative">

      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">

        {/* PANEL GAUCHE : Branding & Visuel (5 colonnes) */}
        <div className="md:col-span-5 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Glow background effect */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Name */}
          <Link to="/">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                F
              </div>

              <span className="font-bold text-lg tracking-wide text-white">
                FinanceTracker
              </span>
            </div>
          </Link>

          {/* Middle Pitch */}
          <div className="my-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white mb-3">
              Gérez votre croissance.
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Suivez vos revenus, maîtrisez vos dépenses et visualisez votre trésorerie en temps réel.
            </p>
          </div>

          {/* Bottom Card Preview Badge */}
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

        {/* PANEL DROIT : Formulaire de connexion (7 colonnes) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
          <div className="max-w-sm w-full mx-auto">

            {/* Form Header */}
            <div className="mb-8">
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
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Mot de passe
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-purple-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Footer Sign Up Link */}
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