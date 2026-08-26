import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import Theme from '../components/dark.mode';
import '../App.css';

function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData(e.target);

        const data = {
            firstName: formData.get('firstname'),
            lastName: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await api.post('/signup', data);

            console.log(response.data);

            navigate('/login', {
                state: {
                    message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.'
                }
            });

            setSuccess('Compte créé avec succès !');
            e.target.reset();

        } catch (err) {
            console.error(err);

            if (err.response) {
                setError(err.response.data.message || 'Échec de l\'inscription.');
            } else {
                setError('Impossible de contacter le serveur.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans relative">

            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">

                {/* PANEL GAUCHE : Branding & Visuel (5 colonnes) */}
                <div className="md:col-span-5 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Glow background effects */}
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

                    {/* Pitch */}
                    <div className="my-8 relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white mb-3">
                            Rejoignez l'aventure.
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                            Prenez le contrôle de vos finances dès aujourd'hui avec un suivi clair et personnalisé.
                        </p>
                    </div>

                    {/* Preview Badge */}
                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-200 font-bold text-xs shrink-0">
                            🚀
                        </div>
                        <div className="text-xs">
                            <div className="font-semibold text-white">Configuration rapide</div>
                            <div className="text-[10px] text-purple-200/70">Créez votre espace en 1 minute</div>
                        </div>
                    </div>
                </div>

                {/* PANEL DROIT : Formulaire d'inscription (7 colonnes) */}
                <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-gray-900">
                    <div className="max-w-sm w-full mx-auto">

                        {/* Form Header */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Créer un compte ✨
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Remplissez les informations ci-dessous pour démarrer
                            </p>
                        </div>

                        {/* Flash Messages */}
                        {error && (
                            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-rose-500 text-xs font-medium flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                                <span>✓</span> {success}
                            </div>
                        )}

                        {/* Form Fields */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                {/* FIRSTNAME */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        required
                                        placeholder="John"
                                        className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                {/* LASTNAME */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        required
                                        placeholder="Doe"
                                        className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="nom@exemple.com"
                                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                                />
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all"
                                />
                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-purple-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Création du compte...
                                    </>
                                ) : (
                                    'S\'inscrire'
                                )}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                            Déjà un compte ?{' '}
                            <Link
                                to="/login"
                                className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors"
                            >
                                Se connecter
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signup;