import { Link } from "react-router-dom";
import FTlogo from "../assets/FT-logo.jpg";

function Home() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-10 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                {/* HERO SECTION */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">

                    {/* LEFT */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white leading-tight">
                            Prennez le controle sur votre
                            <span className="text-[#6366f1]"> argent</span>
                        </h1>

                        <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">
                            Suivez vos dépenses,
                             gérez votre budget et augmentez votre épargne grâce
                              à un tableau de bord simple et performant.
                        </p>

                        <div className="mt-8 flex gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-3 rounded-xl text-white font-semibold"
                                style={{
                                    background: "linear-gradient(90deg, #3c00c8, #302263)",
                                }}
                            >
                                Se connecter
                            </Link>

                            <Link
                                to="/signup"
                                className="px-6 py-3 rounded-xl border border-gray-400 dark:border-gray-700 hover:bg-violet-800 transition duration-500 text-black dark:text-white"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT */}
                    
                </div>

                {/* FEATURES */}
                <div className="mt-20 grid md:grid-cols-3 gap-8">

                    {/* Feature 1 */}
                    <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 shadow-lg">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                            Suivi des dépenses
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Easily record and categorize your daily expenses.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 shadow-lg">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                            Analyse intelligente
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Visualisez vos dépenses grâce à des analyses.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-6 rounded-2xl border border-gray-300 dark:border-gray-800 shadow-lg">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                            Securiser & Simple
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vos données sont accessibles à tout moment.
                        </p>
                    </div>

                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
                        Commencez à gérer votre argent dès aujourd'hui
                    </h2>

                    <Link
                        to="/signup"
                        className="inline-block mt-6 px-8 py-4 rounded-xl text-white font-semibold"
                        style={{
                            background: "linear-gradient(90deg, #3c00c8, #302263)",
                        }}
                    >
                        S'incrire
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Home;