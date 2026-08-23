import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const PURPLE = '#7F77DD';
const PURPLE_DARK = '#534AB7';
const PURPLE_LIGHT = '#EEEDFE';
const TEAL = '#1D9E75';
const RED = '#E24B4A';

function Dashboard() {
    const flowRef = useRef(null);
    const pieRef = useRef(null);

    /*
     * Dashboard
     */
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    /*
     * Modal transaction
     */
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    const [transactionType, setTransactionType] = useState('income');

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [transactionError, setTransactionError] = useState(null);

    /*
 * Catégories par défaut
 */
    const incomeCategories = [
        {
            value: 'Salaire',
            label: 'Salaire',
            icon: '💼',
        },
        {
            value: 'Freelance',
            label: 'Freelance',
            icon: '💻',
        },
        {
            value: 'Prime',
            label: 'Prime',
            icon: '🎁',
        },
        {
            value: 'Autres revenus',
            label: 'Autres revenus',
            icon: '💰',
        },
    ];

    const expenseCategories = [
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
            value: 'Bricolage',
            label: 'Bricolage',
            icon: '🔨',
        },
        {
            value: 'Maison',
            label: 'Maison',
            icon: '🏡',
        },
        {
            value: 'Santé',
            label: 'Santé',
            icon: '❤️',
        },
        {
            value: 'Sorties',
            label: 'Sorties',
            icon: '🎉',
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
            value: 'Shopping',
            label: 'Shopping',
            icon: '🛍️',
        },
        {
            value: 'Éducation',
            label: 'Éducation',
            icon: '📚',
        },
        {
            value: 'Autres dépenses',
            label: 'Autres dépenses',
            icon: '💸',
        },
    ];

    /*
     * Récupération du dashboard
     */
    const fetchDashboard = async () => {
        try {
            const response = await api.get('/dashboard');

            setDashboard(response.data);

            console.log('Dashboard:', response.data);
        } catch (error) {
            console.error(
                'Erreur lors du chargement du dashboard :',
                error
            );

            setError('Impossible de charger le dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    /*
     * Ouvrir le formulaire Income
     */
    const handleIncome = () => {
        setTransactionType('income');

        setAmount('');
        setCategory('');
        setDescription('');
        setTransactionError(null);

        setShowTransactionModal(true);
    };

    /*
     * Ouvrir le formulaire Expense
     */
    const handleExpense = () => {
        setTransactionType('expense');

        setAmount('');
        setCategory('');
        setDescription('');
        setTransactionError(null);

        setShowTransactionModal(true);
    };

    /*
     * Fermer le formulaire
     */
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

    /*
     * Création de la transaction
     */
    const handleSubmitTransaction = async (event) => {
        event.preventDefault();

        setTransactionError(null);

        /*
         * Validation frontend
         */
        if (!amount || Number(amount) <= 0) {
            setTransactionError(
                'Veuillez entrer un montant valide.'
            );

            return;
        }

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

            /*
             * Fermer le formulaire
             */
            setShowTransactionModal(false);

            setAmount('');
            setCategory('');
            setDescription('');

            /*
             * Recharger le dashboard
             *
             * Cela permet de récupérer :
             * - balance
             * - income
             * - expense
             * - saving
             * - transactions
             * - monthly
             */
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

    /*
     * Date actuelle
     */
    const month = new Date().toLocaleString('fr-FR', {
        month: 'long',
    });

    const Month =
        month.charAt(0).toUpperCase() +
        month.slice(1);

    const day = new Date().getDate();

    /*
     * Données provenant du backend
     */
    const balance = dashboard?.balance ?? 0;
    const income = dashboard?.income ?? 0;
    const expense = dashboard?.expense ?? 0;

    /*
     * Economies
     */
    const saving = dashboard?.saving ?? (income - expense);

    /*
     * Formatage des montants
     */
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 2,
        }).format(Number(amount));
    };

    /*
     * Chargement des graphiques
     */
    useEffect(() => {
        if (typeof window === 'undefined') {
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

            const isDark = matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches;

            const gridColor = isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.06)';

            const textColor = '#888780';

            /*
             * Flow chart
             */
            if (flowRef.current) {
                flowChart = new Chart(flowRef.current, {
                    type: 'bar',

                    data: {
                        labels: [
                            'Dec',
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                        ],

                        datasets: [
                            {
                                label: 'Income',

                                data: [
                                    3800,
                                    3900,
                                    4000,
                                    3700,
                                    3900,
                                    4200,
                                ],

                                backgroundColor: PURPLE,
                                borderRadius: 4,
                                barPercentage: 0.5,
                            },

                            {
                                label: 'Expenses',

                                data: [
                                    2400,
                                    2600,
                                    2300,
                                    2800,
                                    2570,
                                    2750,
                                ],

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
                                grid: {
                                    color: gridColor,
                                },

                                ticks: {
                                    color: textColor,

                                    font: {
                                        size: 11,
                                    },

                                    callback: (v) =>
                                        `${(v / 1000).toFixed(1)}k Ar`,
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
             * Pie chart
             */
            if (pieRef.current) {
                pieChart = new Chart(pieRef.current, {
                    type: 'doughnut',

                    data: {
                        labels: [
                            'Housing',
                            'Food',
                            'Transport',
                            'Entertainment',
                            'Health',
                            'Savings',
                        ],

                        datasets: [
                            {
                                data: [
                                    950,
                                    340,
                                    180,
                                    210,
                                    90,
                                    1450,
                                ],

                                backgroundColor: [
                                    PURPLE,
                                    TEAL,
                                    '#EF9F27',
                                    RED,
                                    '#5DCAA5',
                                    '#AFA9EC',
                                ],

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
                        },
                    },
                });
            }
        };

        loadChart();

        /*
         * Nettoyage
         */
        return () => {
            if (flowChart) {
                flowChart.destroy();
            }

            if (pieChart) {
                pieChart.destroy();
            }
        };
    }, []);

    /*
     * Loading
     */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Chargement du dashboard...
                </div>
            </div>
        );
    }

    /*
     * Error
     */
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                    <div className="text-red-500 mb-2">
                        Une erreur est survenue
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">

            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-2">

                    <div
                        className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                        style={{
                            background: PURPLE,
                        }}
                    >
                        <span className="text-white text-xs">
                            FT
                        </span>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Finance Tracker
                        </div>

                        <div className="text-[11px] text-gray-400">
                            Manage your money smarter
                        </div>
                    </div>

                </div>

                <div className="flex items-center gap-2">

                    <span
                        className="text-[11px] px-3 py-1 rounded-full border mr-2"
                        style={{
                            background: PURPLE_LIGHT,
                            color: PURPLE_DARK,
                            borderColor: '#AFA9EC',
                        }}
                    >
                        {day} {Month}
                    </span>

                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border"
                        style={{
                            background: PURPLE_LIGHT,
                            color: PURPLE_DARK,
                            borderColor: '#AFA9EC',
                        }}
                    >
                        JD
                    </div>

                </div>

            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">

                {[
                    {
                        label: 'Solde',
                        value: balance,
                        change: 'Solde actuel',
                        up: true,
                    },

                    {
                        label: 'Revenus',
                        value: income,
                        change: 'Revenus',
                        up: true,
                    },

                    {
                        label: 'Depenses',
                        value: expense,
                        change: 'Dépenses',
                        up: false,
                    },

                    {
                        label: 'Economies',
                        value: saving,
                        change: 'Disponible / épargne',
                        up: saving >= 0,
                    },
                ].map((m) => (

                    <div
                        key={m.label}
                        className="bg-white dark:bg-gray-800 rounded-lg p-3"
                    >

                        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                            {m.label}
                        </div>

                        <div className="text-xl font-medium text-gray-900 dark:text-white">
                            {formatAmount(m.value)} Ar
                        </div>

                        <div
                            className={`text-[11px] mt-1 ${m.up
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                                }`}
                        >
                            {m.change}
                        </div>

                    </div>

                ))}

            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-4">

                {[
                    {
                        label: 'Add income',
                        icon: '+',
                        action: handleIncome,
                    },

                    {
                        label: 'Add expense',
                        icon: '-',
                        action: handleExpense,
                    },

                    {
                        label: 'Analysis',
                        icon: '↗',
                        action: () => { },
                    },

                    {
                        label: 'Export',
                        icon: '↓',
                        action: () => { },
                    },
                ].map((a) => (

                    <button
                        key={a.label}
                        onClick={a.action}
                        className="flex-1 flex flex-col items-center gap-1 bg-white dark:bg-gray-800 rounded-lg py-2 px-1 text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-none"
                    >

                        <span
                            className="text-lg font-medium"
                            style={{
                                color: PURPLE,
                            }}
                        >
                            {a.icon}
                        </span>

                        <span className="hidden sm:block">
                            {a.label}
                        </span>

                    </button>

                ))}

            </div>

            {/* Cash flow chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">

                <div className="text-[13px] font-medium text-gray-400 mb-3">
                    Cash flow — last 6 months
                </div>

                <div className="flex gap-4 mb-3">

                    {[
                        {
                            color: PURPLE,
                            label: 'Income',
                        },

                        {
                            color: '#CECBF6',
                            label: 'Expenses',
                        },
                    ].map((l) => (

                        <span
                            key={l.label}
                            className="flex items-center gap-1 text-[12px] text-gray-400"
                        >

                            <span
                                className="w-2.5 h-2.5 rounded-sm inline-block"
                                style={{
                                    background: l.color,
                                }}
                            />

                            {l.label}

                        </span>

                    ))}

                </div>

                <div className="relative w-full h-44">
                    <canvas ref={flowRef} />
                </div>

            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">

                    <div className="text-[13px] font-medium text-gray-400 mb-3">
                        Recent transactions
                    </div>

                    {dashboard?.transactions?.length > 0 ? (

                        dashboard.transactions
                            .slice(0, 5)
                            .map((transaction) => (

                                <div
                                    key={transaction.id}
                                    className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-none"
                                >

                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                        style={{
                                            background:
                                                transaction.type === 'income'
                                                    ? '#E1F5EE'
                                                    : '#FBEAF0',
                                        }}
                                    >
                                        {transaction.type === 'income'
                                            ? '↗'
                                            : '↘'}
                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <div className="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                                            {transaction.description ||
                                                'Transaction'}
                                        </div>

                                        <div className="text-[11px] text-gray-400 mr-2">
                                            {transaction.date}
                                        </div>

                                    </div>

                                    <div
                                        className={`text-[13px] font-medium shrink-0 ${transaction.type === 'income'
                                                ? 'text-emerald-600'
                                                : 'text-red-500'
                                            }`}
                                    >
                                        {transaction.type === 'income'
                                            ? '+'
                                            : '-'}

                                        {formatAmount(
                                            transaction.amount
                                        )}{' '}
                                        Ar
                                    </div>

                                </div>

                            ))

                    ) : (

                        <div className="py-6 text-center text-sm text-gray-400">
                            Aucune transaction pour le moment.
                        </div>

                    )}

                </div>

                {/* Budget + Donut */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">

                    <div className="text-[13px] font-medium text-gray-400 mb-3">
                        Budget usage
                    </div>

                    {[
                        {
                            label: 'Housing',
                            spent: 950,
                            total: 1000,
                            color: PURPLE,
                        },

                        {
                            label: 'Food',
                            spent: 340,
                            total: 500,
                            color: TEAL,
                        },

                        {
                            label: 'Transport',
                            spent: 180,
                            total: 300,
                            color: TEAL,
                        },

                        {
                            label: 'Entertainment',
                            spent: 210,
                            total: 200,
                            color: RED,
                        },

                        {
                            label: 'Health',
                            spent: 90,
                            total: 150,
                            color: TEAL,
                        },
                    ].map((b) => (

                        <div
                            key={b.label}
                            className="mb-3"
                        >

                            <div className="flex justify-between text-[12px] text-gray-400 mb-1">

                                <span>
                                    {b.label}
                                </span>

                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {b.spent} / {b.total} Ar
                                </span>

                            </div>

                            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">

                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            (b.spent / b.total) * 100,
                                            100
                                        )}%`,
                                        background: b.color,
                                    }}
                                />

                            </div>

                        </div>

                    ))}

                    <div className="mt-3">

                        <div className="text-[12px] text-gray-400 mb-2">
                            Spending by category
                        </div>

                        <div className="relative h-28 w-full">
                            <canvas ref={pieRef} />
                        </div>

                    </div>

                </div>

            </div>

            {/* =====================================================
                MODAL CREATE TRANSACTION
               ===================================================== */}

            {showTransactionModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">

                            <div>

                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {transactionType === 'income'
                                        ? 'Ajouter un revenu'
                                        : 'Ajouter une dépense'}
                                </h2>

                                <p className="text-xs text-gray-400 mt-1">
                                    {transactionType === 'income'
                                        ? 'Enregistrer un nouveau revenu'
                                        : 'Enregistrer une nouvelle dépense'}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={submitting}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitTransaction}>

                            {/* Amount */}
                            <div className="mb-4">

                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    Montant
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    placeholder="Ex: 200000"
                                    disabled={submitting}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-300"
                                    autoFocus
                                />

                                <div className="text-[11px] text-gray-400 mt-1">
                                    Montant en Ariary (Ar)
                                </div>

                            </div>

                            {/* Category */}
                            <div className="mb-4">

                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    Catégorie
                                </label>

                                <select
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                    disabled={submitting}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="">
                                        Sélectionner une catégorie
                                    </option>

                                    {(transactionType === 'income'
                                        ? incomeCategories
                                        : expenseCategories
                                    ).map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.icon} {item.label}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* Type */}
                            <div className="mb-4">

                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    Type
                                </label>

                                <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                                    {transactionType === 'income'
                                        ? 'Revenu'
                                        : 'Dépense'}
                                </div>

                            </div>

                            {/* Description */}
                            <div className="mb-4">

                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    placeholder="Ex: Salaire du mois"
                                    rows={3}
                                    disabled={submitting}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                                />

                            </div>

                            {/* Error */}
                            {transactionError && (

                                <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-3 py-2.5 text-xs text-red-600 dark:text-red-400">
                                    {transactionError}
                                </div>

                            )}

                            {/* Buttons */}
                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                                    style={{
                                        background:
                                            transactionType === 'income'
                                                ? TEAL
                                                : RED,
                                    }}
                                >
                                    {submitting
                                        ? 'Enregistrement...'
                                        : transactionType === 'income'
                                            ? 'Ajouter le revenu'
                                            : 'Ajouter la dépense'}
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