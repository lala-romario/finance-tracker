import { useEffect, useRef, useState, useMemo } from 'react';
import api from '../api/axios';
import Theme from '../components/dark.mode';
const PURPLE = '#7F77DD';
const PURPLE_DARK = '#534AB7';
const PURPLE_LIGHT = '#EEEDFE';
const TEAL = '#1D9E75';
const RED = '#E24B4A';

const INCOME_CATEGORIES = [
    { value: 'Salaire', label: 'Salaire', icon: '💼' },
    { value: 'Autres revenus', label: 'Autres revenus', icon: '💰' },
];

const EXPENSE_CATEGORIES = [
    { value: 'Alimentation', label: 'Alimentation', icon: '🍔' },
    { value: 'Transport', label: 'Transport', icon: '🚗' },
    { value: 'Logement', label: 'Logement', icon: '🏠' },
    { value: 'Santé', label: 'Santé', icon: '❤️' },
    { value: 'Loisirs', label: 'Loisirs', icon: '🎮' },
    { value: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'Bricolage', label: 'Bricolage', icon: '🔨' },
    { value: 'Matériel maison', label: 'Matériel maison', icon: '🛠️' },
    { value: 'Vacances', label: 'Vacances', icon: '🏖️' },
    { value: 'Abonnements', label: 'Abonnements', icon: '📱' },
    { value: 'Autres dépenses', label: 'Autres dépenses', icon: '📦' },
];

function Dashboard() {
    const flowRef = useRef(null);
    const pieRef = useRef(null);

    // Dashboard & User State
    const [dashboard, setDashboard] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Form State
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('income');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [transactionError, setTransactionError] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // API Handlers
    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard');
            setDashboard(response.data);
            console.log(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement du dashboard :', err);
            setError('Impossible de charger le dashboard.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await api.get('/me');
            setUser(response.data.user);
        } catch (err) {
            console.error('ERREUR USER:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Erreur lors de la déconnexion :', err);
        } finally {
            localStorage.removeItem('token');
            setShowUserMenu(false);
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) {
                await Promise.all([fetchDashboard(), fetchUser()]);
            }
        };
        init();
        return () => { isMounted = false; };
    }, []);

    // Form Handlers
    const openModal = (type) => {
        setTransactionType(type);
        setAmount('');
        setCategory('');
        setDescription('');
        setTransactionError(null);
        setShowTransactionModal(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setShowTransactionModal(false);
        setAmount('');
        setCategory('');
        setDescription('');
        setTransactionError(null);
    };

    const handleSubmitTransaction = async (event) => {
        event.preventDefault();

        setTransactionError(null);

        // Validation du montant
        if (!amount || Number(amount) <= 0) {
            setTransactionError(
                'Veuillez entrer un montant valide.'
            );
            return;
        }

        // Vérification du solde pour une dépense
        if (
            transactionType === 'expense' &&
            Number(amount) > currentBalance
        ) {
            setTransactionError(
                `Solde insuffisant. Votre solde actuel est de ${formatAmount(currentBalance)} Ar.`
            );
            return;
        }

        // Validation catégorie
        if (!category.trim()) {
            setTransactionError(
                'Veuillez sélectionner une catégorie.'
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post('/transactions', {
                amount: amount,
                type: transactionType,
                category: category.trim(),
                description: description.trim() || null,
            });

            console.log(
                'Transaction créée :',
                response.data
            );

            setShowTransactionModal(false);

            setAmount('');
            setCategory('');
            setDescription('');

            await fetchDashboard();

        } catch (error) {
            console.error(
                'Erreur lors de la création de la transaction :',
                error
            );

            const backendMessage =
                error.response?.data?.error ||
                error.response?.data?.message;

            setTransactionError(
                backendMessage ||
                'Impossible de créer la transaction.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Values
    const currentDate = useMemo(() => {
        const now = new Date();
        const monthStr = now.toLocaleString('fr-FR', { month: 'long' });
        return {
            day: now.getDate(),
            month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
        };
    }, []);

    const balance = dashboard?.balance ?? 0;
    const income = dashboard?.income ?? 0;
    const expense = dashboard?.expense ?? 0;
    const saving = dashboard?.saving ?? (income - expense);
    const currentBalance = Number(balance);

    const userInitials = useMemo(() => {
        if (!user) return '??';
        return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
    }, [user]);

    const formatAmount = (val) => {
        return new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 2,
        }).format(Number(val));
    };

    // Chart initialization
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!dashboard) {
            return;
        }

        let flowChart;
        let pieChart;

        const loadChart = async () => {
            const {
                Chart,
                registerables,
            } = await import('chart.js');

            Chart.register(...registerables);

            const isDark = window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches;

            const gridColor = isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.06)';

            const textColor = '#888780';

            /*
             * =====================================================
             * DONNÉES DU BACKEND
             * =====================================================
             */

            const monthly = dashboard.monthly ?? [];

            const categories = dashboard.categories ?? [];

            /*
             * =====================================================
             * BAR CHART
             * =====================================================
             */

            if (flowRef.current) {

                /*
                 * On prend les 6 derniers mois
                 */
                const lastMonths = [...monthly]
                    .sort((a, b) =>
                        a.month.localeCompare(b.month)
                    )
                    .slice(-6);

                /*
                 * Transformer 2026-08 en "Août"
                 */
                const monthLabels = lastMonths.map((item) => {

                    const date = new Date(
                        `${item.month}-01T00:00:00`
                    );

                    return date.toLocaleString('fr-FR', {
                        month: 'short',
                    });
                });

                const incomeData = lastMonths.map(
                    (item) => Number(item.income)
                );

                const expenseData = lastMonths.map(
                    (item) => Number(item.expense)
                );

                flowChart = new Chart(flowRef.current, {

                    type: 'bar',

                    data: {

                        labels: monthLabels,

                        datasets: [

                            {
                                label: 'Income',

                                data: incomeData,

                                backgroundColor: PURPLE,

                                borderRadius: 4,

                                barPercentage: 0.5,
                            },

                            {
                                label: 'Expenses',

                                data: expenseData,

                                backgroundColor: isDark
                                    ? '#3C3489'
                                    : '#CECBF6',

                                borderRadius: 4,

                                barPercentage: 0.5,
                            },

                        ],
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false,
                            },

                            tooltip: {

                                callbacks: {

                                    label: (context) => {

                                        return `${context.dataset.label}: ${formatAmount(
                                            context.raw
                                        )} Ar`;
                                    },

                                },

                            },

                        },

                        scales: {

                            x: {

                                grid: {
                                    display: false,
                                },

                                ticks: {

                                    color: textColor,

                                    font: {
                                        size: 11,
                                    },

                                },

                            },

                            y: {

                                beginAtZero: true,

                                grid: {

                                    color: gridColor,

                                },

                                ticks: {

                                    color: textColor,

                                    font: {
                                        size: 11,
                                    },

                                    callback: (value) =>
                                        `${(
                                            Number(value) / 1000
                                        ).toFixed(0)}k Ar`,

                                },

                                border: {
                                    display: false,
                                },

                            },

                        },

                    },

                });
            }

            /*
             * =====================================================
             * DOUGHNUT CHART
             * =====================================================
             */

            if (pieRef.current) {

                const categoryLabels = categories.map(
                    (category) => category.name
                );

                const categoryValues = categories.map(
                    (category) => Number(category.amount)
                );

                /*
                 * Couleurs du Doughnut
                 */
                const categoryColors = [
                    PURPLE,
                    TEAL,
                    '#EF9F27',
                    RED,
                    '#5DCAA5',
                    '#AFA9EC',
                    '#D85C5C',
                    '#6B9AC4',
                    '#8B6FB8',
                    '#D4A72C',
                ];

                pieChart = new Chart(pieRef.current, {

                    type: 'doughnut',

                    data: {

                        labels: categoryLabels,

                        datasets: [

                            {
                                data: categoryValues,

                                backgroundColor: categoryValues.map(
                                    (_, index) =>
                                        categoryColors[
                                        index %
                                        categoryColors.length
                                        ]
                                ),

                                borderWidth: 0,

                                hoverOffset: 4,
                            },

                        ],

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: '65%',

                        plugins: {

                            legend: {
                                display: false,
                            },

                            tooltip: {

                                callbacks: {

                                    label: (context) => {

                                        const value =
                                            Number(context.raw);

                                        return `${context.label}: ${formatAmount(
                                            value
                                        )} Ar`;
                                    },

                                },

                            },

                        },

                    },

                });
            }
        };

        loadChart();

        /*
         * =====================================================
         * NETTOYAGE
         * =====================================================
         */

        return () => {

            if (flowChart) {
                flowChart.destroy();
            }

            if (pieChart) {
                pieChart.destroy();
            }

        };

    }, [dashboard]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                    Chargement du dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center max-w-sm shadow-xl">
                    <div className="text-red-500 font-semibold mb-1">Une erreur est survenue</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row font-sans">

            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-5 flex flex-col justify-between shrink-0">
                <div>
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20">
                            F
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none text-gray-900 dark:text-white">FinanceTracker</h1>
                            <span className="text-[11px] text-gray-400">Personal Dashboard</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2 mb-8">
                        <button
                            type="button"
                            onClick={() => openModal('income')}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Ajouter un revenu
                        </button>
                        <button
                            type="button"
                            onClick={() => openModal('expense')}
                            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                            Ajouter une dépense
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        <a href="#overview" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 font-medium text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Dashboard
                        </a>
                        <a href="#transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium text-xs transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Transactions
                        </a>
                    </nav>
                </div>

                {/* User Menu Widget */}
                <div className="relative pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => setShowUserMenu((p) => !p)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                {userInitials}
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                                    {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
                            </div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-xs text-rose-500 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Se déconnecter
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aperçu Financier</h2>
                        <p className="text-xs text-gray-400">Bienvenue, voici l'état de vos finances.</p>
                    </div>

                    <div className="text-xs font-medium bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                        {currentDate.day} {currentDate.month}
                    </div>
                </header>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Solde Total', value: balance, color: 'text-gray-900 dark:text-white' },
                        { label: 'Revenus', value: income, color: 'text-emerald-500' },
                        { label: 'Dépenses', value: expense, color: 'text-rose-500' },
                        { label: 'Épargne / Restant', value: saving, color: saving >= 0 ? 'text-purple-600' : 'text-rose-500' },
                    ].map((card) => (
                        <div key={card.label} className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{card.label}</span>
                            <div className={`text-2xl font-bold mt-2 ${card.color}`}>
                                {formatAmount(card.value)} <span className="text-xs font-normal text-gray-400">Ar</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Flux de Trésorerie</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenus</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Dépenses</span>
                            </div>
                        </div>
                        <div className="h-60 relative w-full">
                            <canvas ref={flowRef} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Répartition des Dépenses</h3>
                        <div className="h-44 relative w-full my-auto">
                            <canvas ref={pieRef} />
                        </div>
                    </div>
                </div>

                {/* Transactions & Budget Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Dernières Transactions</h3>
                        {dashboard?.transactions?.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {dashboard.transactions.slice(0, 5).map((t) => (
                                    <div key={t.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50'}`}>
                                                {t.type === 'income' ? '+' : '-'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-900 dark:text-white">{t.description || 'Transaction'}</div>
                                                <div className="text-[10px] text-gray-400">{t.date}</div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)} Ar
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-xs text-gray-400">Aucune transaction récente</div>
                        )}
                    </div>

                    {/* Budget Usage */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Utilisation du Budget</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Housing', spent: 950, total: 1000, color: 'bg-purple-500' },
                                { label: 'Food', spent: 340, total: 500, color: 'bg-emerald-500' },
                                { label: 'Transport', spent: 180, total: 300, color: 'bg-amber-500' },
                                { label: 'Entertainment', spent: 210, total: 200, color: 'bg-rose-500' },
                            ].map((b) => (
                                <div key={b.label}>
                                    <div className="flex justify-between text-xs mb-1 font-medium">
                                        <span className="text-gray-500 dark:text-gray-400">{b.label}</span>
                                        <span className="text-gray-900 dark:text-white">{b.spent} / {b.total} Ar</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${b.color} rounded-full transition-all duration-300`}
                                            style={{ width: `${Math.min((b.spent / b.total) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Transaction Modal */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {transactionType === 'income' ? 'Ajouter un Revenu' : 'Ajouter une Dépense'}
                            </h3>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                        </div>

                        <form onSubmit={handleSubmitTransaction} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Montant (Ar)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Catégorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {(transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((item) => (
                                        <option key={item.value} value={item.value}>{item.icon} {item.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Détails de la transaction..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            {transactionError && (
                                <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl border border-red-100">{transactionError}</div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity ${transactionType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'} disabled:opacity-50`}
                                >
                                    {submitting ? 'Enregistrement...' : 'Valider'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;