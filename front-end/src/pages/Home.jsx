import { Link } from "react-router-dom";
import Theme from "../components/dark.mode";

function Home() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 relative overflow-hidden">

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-50/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-purple-500/20">
                            F
                        </div>
                        <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-wide">
                            FinanceTracker
                        </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Bouton Theme */}
                        <Theme />

                        {/* Masqué sur mobile, visible à partir de 'sm' (640px) */}
                        <Link
                            to="/login"
                            className="hidden sm:block px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-all"
                        >
                            Se connecter
                        </Link>

                        {/* Bouton CTA réduit légèrement sur mobile */}
                        <Link
                            to="/signup"
                            className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-[0.98]"
                        >
                            S'inscrire
                        </Link>
                    </div>

                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="max-w-6xl mx-auto px-6 pt-8 pb-20 relative z-10">

                {/* HERO SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[480px]">

                    {/* Hero Text (7 cols) */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.15] tracking-tight">
                            Prenez le contrôle sur votre{" "}
                            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                                argent.
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Suivez vos dépenses, maîtrisez votre budget et développez votre épargne grâce à un tableau de bord intelligent, simple et sécurisé.
                        </p>

                        {/* CTA Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                            <Link
                                to="/signup"
                                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all duration-200 shadow-lg shadow-purple-600/25 active:scale-[0.98] text-center flex items-center justify-center gap-2 group"
                            >
                                Commencer gratuitement
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>

                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all text-center"
                            >
                                Accéder au Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Hero Graphic / Dashboard Card Preview (5 cols) */}
                    <div className="lg:col-span-5 relative flex justify-center">
                        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 transition-transform hover:-translate-y-1 duration-300">

                            {/* Card Header Preview */}
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center justify-center">
                                        Ar
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 dark:text-white">Solde Total</div>
                                        <div className="text-[10px] text-gray-400">Août 2026</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                                    +12.5%
                                </span>
                            </div>

                            {/* Big Number */}
                            <div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    2 450 000 <span className="text-sm font-normal text-gray-400">Ar</span>
                                </div>
                            </div>

                            {/* Mini Bars Visual Animation */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-medium text-gray-400">
                                    <span>Épargne Objectif</span>
                                    <span className="text-purple-600 dark:text-purple-400 font-bold">75%</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full w-[75%] transition-all duration-1000" />
                                </div>
                            </div>

                            {/* Recent items list preview */}
                            <div className="pt-2 space-y-2">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center text-xs">
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                        <span>💼</span> Salaire
                                    </span>
                                    <span className="font-bold text-emerald-500">+1 500 000 Ar</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center text-xs">
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                        <span>🛒</span> Courses
                                    </span>
                                    <span className="font-bold text-rose-500">-120 000 Ar</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* FEATURES SECTION */}
                <div className="mt-28">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">
                            Fonctionnalités
                        </h2>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                            Tout ce dont vous avez besoin pour vos finances
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1 */}
                        <div className="p-7 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
                                📊
                            </div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                Suivi des dépenses
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Enregistrez et catégorisez vos transactions quotidiennes en quelques clics sans prise de tête.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-7 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
                                📈
                            </div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                Analyse intelligente
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Visualisez vos flux de trésorerie et la répartition de vos budgets grâce à des graphiques clairs.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-7 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
                                🔒
                            </div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                Sécurisé & Simple
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Vos informations sont sécurisées et votre dashboard est accessible en toute simplicité où que vous soyez.
                            </p>
                        </div>

                    </div>
                </div>

                {/* BOTTOM CALL TO ACTION BANNER */}
                <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 text-white text-center relative overflow-hidden shadow-2xl">
                    {/* Background glow effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 max-w-xl mx-auto space-y-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                            Commencez à gérer votre argent dès aujourd'hui
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-200/80">
                            Créez votre compte en moins d'une minute et commencez à optimiser vos dépenses.
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/signup"
                                className="inline-block px-8 py-3.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition-all shadow-xl active:scale-[0.98]"
                            >
                                Créer un compte gratuit
                            </Link>
                        </div>
                    </div>
                </div>

            </main>

            {/* FOOTER */}
            <footer className="border-t border-gray-200/80 dark:border-gray-800 py-6 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} FinanceTracker. Tous droits réservés.
            </footer>
        </div>
    );
}

export default Home;