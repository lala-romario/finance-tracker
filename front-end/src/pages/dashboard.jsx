import { useEffect, useState } from 'react';

import api from '../api/axios';

import Dashboard from '../components/dashboard';
import Transactions from '../components/transactions';
import Analyses from '../components/analysis';
import Objectifs from '../components/goal';
import TransactionsRecurrentes from '../components/recurringTransactions';
import AssistantFinancier from '../components/financialAssistant';

function DashboardPage() {

    // =========================================================
    // DASHBOARD & USER
    // =========================================================

    const [dashboard, setDashboard] = useState(null);
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const [activeSection, setActiveSection] =
        useState('dashboard');

    // =========================================================
    // TRANSACTION MODAL
    // =========================================================

    const [showTransactionModal, setShowTransactionModal] =
        useState(false);

    const [transactionType, setTransactionType] =
        useState('income');

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [transactionError, setTransactionError] = useState(null);

    // =========================================================
    // USER MENU
    // =========================================================

    const [showUserMenu, setShowUserMenu] = useState(false);

    // =========================================================
    // CATEGORIES
    // =========================================================

    const INCOME_CATEGORIES = [
        {
            value: 'Salaire',
            label: 'Salaire',
            icon: '💼',
        },
        {
            value: 'Autres revenus',
            label: 'Autres revenus',
            icon: '💰',
        },
    ];

    const EXPENSE_CATEGORIES = [
        {
            value: 'Alimentation',
            label: 'Alimentation',
            icon: '🍔',
        },
        {
            value: 'Transport',
            label: 'Transport',
            icon: '🚗',
        },
        {
            value: 'Logement',
            label: 'Logement',
            icon: '🏠',
        },
        {
            value: 'Santé',
            label: 'Santé',
            icon: '❤️',
        },
        {
            value: 'Loisirs',
            label: 'Loisirs',
            icon: '🎮',
        },
        {
            value: 'Shopping',
            label: 'Shopping',
            icon: '🛍️',
        },
        {
            value: 'Bricolage',
            label: 'Bricolage',
            icon: '🔨',
        },
        {
            value: 'Matériel maison',
            label: 'Matériel maison',
            icon: '🛠️',
        },
        {
            value: 'Vacances',
            label: 'Vacances',
            icon: '🏖️',
        },
        {
            value: 'Abonnements',
            label: 'Abonnements',
            icon: '📱',
        },
        {
            value: 'Autres dépenses',
            label: 'Autres dépenses',
            icon: '📦',
        },
    ];

    // =========================================================
    // FETCH DASHBOARD
    // =========================================================

    const fetchDashboard = async () => {

        try {

            const response =
                await api.get('/dashboard');

            setDashboard(response.data);

            console.log(
                'Dashboard:',
                response.data
            );

        } catch (err) {

            console.error(
                'Erreur lors du chargement du dashboard :',
                err
            );

            setError(
                'Impossible de charger le dashboard.'
            );

        } finally {

            setLoading(false);

        }
    };

    // =========================================================
    // FETCH USER
    // =========================================================

    const fetchUser = async () => {

        try {

            const response =
                await api.get('/me');

            setUser(response.data.user);

        } catch (err) {

            console.error(
                'Erreur utilisateur :',
                err
            );

        }
    };

    // =========================================================
    // INITIALISATION
    // =========================================================

    useEffect(() => {

        const init = async () => {

            await Promise.all([
                fetchDashboard(),
                fetchUser(),
            ]);

        };

        init();

    }, []);

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {

        try {

            await api.post('/logout');

        } catch (err) {

            console.error(
                'Erreur lors de la déconnexion :',
                err
            );

        } finally {

            localStorage.removeItem('token');

            setShowUserMenu(false);

            window.location.href = '/login';

        }
    };

    // =========================================================
    // OPEN TRANSACTION MODAL
    // =========================================================

    const openModal = (type) => {

        setTransactionType(type);

        setAmount('');
        setCategory('');
        setDescription('');

        setTransactionError(null);

        setShowTransactionModal(true);
    };

    // =========================================================
    // CLOSE TRANSACTION MODAL
    // =========================================================

    const handleCloseModal = () => {

        if (submitting) {
            return;
        }

        setShowTransactionModal(false);

        setAmount('');
        setCategory('');
        setDescription('');

        setTransactionError(null);
    };

    // =========================================================
    // FORMAT AMOUNT
    // =========================================================

    const formatAmount = (value) => {

        return new Intl.NumberFormat(
            'fr-FR',
            {
                maximumFractionDigits: 2,
            }
        ).format(Number(value));
    };

    // =========================================================
    // SUBMIT TRANSACTION
    // =========================================================

    const handleSubmitTransaction = async (event) => {

        event.preventDefault();

        setTransactionError(null);

        // -----------------------------------------------------
        // Montant
        // -----------------------------------------------------

        if (
            !amount ||
            Number(amount) <= 0
        ) {

            setTransactionError(
                'Veuillez entrer un montant valide.'
            );

            return;
        }

        // -----------------------------------------------------
        // Solde actuel
        // -----------------------------------------------------

        const currentBalance =
            Number(
                dashboard?.balance ?? 0
            );

        // -----------------------------------------------------
        // Vérification dépense
        // -----------------------------------------------------

        if (
            transactionType === 'expense' &&
            Number(amount) > currentBalance
        ) {

            setTransactionError(
                `Solde insuffisant. Votre solde actuel est de ${formatAmount(
                    currentBalance
                )} Ar.`
            );

            return;
        }

        // -----------------------------------------------------
        // Catégorie
        // -----------------------------------------------------

        if (!category.trim()) {

            setTransactionError(
                'Veuillez sélectionner une catégorie.'
            );

            return;
        }

        try {

            setSubmitting(true);

            const response =
                await api.post(
                    '/transactions',
                    {
                        amount,
                        type: transactionType,
                        category:
                            category.trim(),
                        description:
                            description.trim() ||
                            null,
                    }
                );

            console.log(
                'Transaction créée :',
                response.data
            );

            // Fermer modal
            setShowTransactionModal(false);

            // Reset
            setAmount('');
            setCategory('');
            setDescription('');

            // Mise à jour dashboard
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

    // =========================================================
    // USER INITIALS
    // =========================================================

    const userInitials = user
        ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
        : '??';

    // =========================================================
    // NAVIGATION ITEMS
    // =========================================================

    const navigationItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
            ),
        },

        {
            id: 'transactions',
            label: 'Transactions',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                    />
                </svg>
            ),
        },

        {
            id: 'analyses',
            label: 'Analyses',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3v18h18M7 16l4-5 3 3 5-7"
                    />
                </svg>
            ),
        },

        {
            id: 'objectifs',
            label: 'Objectifs',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15l3.5 2-1-4 3-2.5-4-.5L12 6l-1.5 4-4 .5 3 2.5-1 4L12 15z"
                    />
                </svg>
            ),
        },

        {
            id: 'recurrentes',
            label: 'Transactions récurrentes',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 7h11l-3-3m8 13H9l3 3M20 7a8 8 0 00-14-4M4 17a8 8 0 0014 4"
                    />
                </svg>
            ),
        },

        {
            id: 'assistant',
            label: 'Assistant financier',
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.5 3h5A3.5 3.5 0 0118 6.5v5A3.5 3.5 0 0114.5 15h-5A3.5 3.5 0 016 11.5v-5A3.5 3.5 0 019.5 3zM9 19h6m-3-4v4"
                    />
                </svg>
            ),
        },
    ];

    // =========================================================
    // CONTENT
    // =========================================================

    const renderContent = () => {

        switch (activeSection) {

            case 'transactions':

                return (
                    <Transactions />
                );

            case 'analyses':

                return (
                    <Analyses />
                );

            case 'objectifs':

                return (
                    <Objectifs />
                );

            case 'recurrentes':

                return (
                    <TransactionsRecurrentes />
                );

            case 'assistant':

                return (
                    <AssistantFinancier />
                );

            case 'dashboard':
            default:

                return (
                    <Dashboard
                        dashboard={dashboard}
                        loading={loading}
                        error={error}
                    />
                );
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col md:flex-row font-sans">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-5 flex flex-col justify-between shrink-0">

                <div>

                    {/* BRAND */}

                    <div className="flex items-center gap-3 mb-8">

                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20">
                            F
                        </div>

                        <div>

                            <h1 className="text-base font-bold leading-none text-gray-900 dark:text-white">
                                FinanceTracker
                            </h1>

                            <span className="text-[11px] text-gray-400">
                                Personal Dashboard
                            </span>

                        </div>

                    </div>

                    {/* QUICK ACTIONS */}

                    <div className="space-y-2 mb-8">

                        <button
                            type="button"
                            onClick={() =>
                                openModal('income')
                            }
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >

                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>

                            Ajouter un revenu

                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                openModal('expense')
                            }
                            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >

                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 12H4"
                                />
                            </svg>

                            Ajouter une dépense

                        </button>

                    </div>

                    {/* NAVIGATION */}

                    <nav className="space-y-1">

                        {navigationItems.map(
                            (item) => (

                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveSection(
                                            item.id
                                        )
                                    }
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                                        activeSection ===
                                        item.id
                                            ? 'bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                >

                                    {item.icon}

                                    <span>
                                        {item.label}
                                    </span>

                                </button>

                            )
                        )}

                    </nav>

                </div>

                {/* =================================================
                    USER
                ================================================= */}

                <div className="relative pt-4 border-t border-gray-100 dark:border-gray-800">

                    <button
                        type="button"
                        onClick={() =>
                            setShowUserMenu(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >

                        <div className="flex items-center gap-2.5 min-w-0">

                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                {userInitials}
                            </div>

                            <div className="text-left min-w-0">

                                <div className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                                    {user
                                        ? `${user.firstName} ${user.lastName}`
                                        : 'Utilisateur'}
                                </div>

                                <div className="text-[10px] text-gray-400 truncate">
                                    {user?.email}
                                </div>

                            </div>

                        </div>

                    </button>

                    {/* USER DROPDOWN */}

                    {showUserMenu && (

                        <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">

                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className="w-full px-4 py-3 text-left text-xs text-rose-500 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2"
                            >

                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>

                                Se déconnecter

                            </button>

                        </div>

                    )}

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">

                {renderContent()}

            </main>

            {/* =================================================
                TRANSACTION MODAL
            ================================================= */}

            {showTransactionModal && (

                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-gray-800">

                        {/* HEADER */}

                        <div className="flex justify-between items-center mb-4">

                            <h3 className="text-base font-bold text-gray-900 dark:text-white">

                                {transactionType ===
                                'income'
                                    ? 'Ajouter un Revenu'
                                    : 'Ajouter une Dépense'}

                            </h3>

                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmitTransaction
                            }
                            className="space-y-4"
                        >

                            {/* MONTANT */}

                            <div>

                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Montant (Ar)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    autoFocus
                                />

                            </div>

                            {/* CATEGORIE */}

                            <div>

                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Catégorie
                                </label>

                                <select
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(
                                            event.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >

                                    <option value="">
                                        Sélectionner une catégorie
                                    </option>

                                    {(
                                        transactionType ===
                                        'income'
                                            ? INCOME_CATEGORIES
                                            : EXPENSE_CATEGORIES
                                    ).map(
                                        (item) => (

                                            <option
                                                key={
                                                    item.value
                                                }
                                                value={
                                                    item.value
                                                }
                                            >
                                                {
                                                    item.icon
                                                }{' '}
                                                {
                                                    item.label
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Détails de la transaction..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />

                            </div>

                            {/* ERROR */}

                            {transactionError && (

                                <div className="p-3 text-xs bg-red-50 text-red-500 rounded-xl border border-red-100">

                                    {transactionError}

                                </div>

                            )}

                            {/* BUTTONS */}

                            <div className="flex gap-2 pt-2">

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity ${
                                        transactionType ===
                                        'income'
                                            ? 'bg-emerald-500'
                                            : 'bg-rose-500'
                                    } disabled:opacity-50`}
                                >

                                    {submitting
                                        ? 'Enregistrement...'
                                        : 'Valider'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default DashboardPage;