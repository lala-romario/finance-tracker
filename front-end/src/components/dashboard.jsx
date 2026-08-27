import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';

const PURPLE = '#7F77DD';
const TEAL = '#1D9E75';
const RED = '#E24B4A';

function Dashboard({
    dashboard,
    loading,
    error,
    fetchDashboard,
}) {
    const flowRef = useRef(null);
    const pieRef = useRef(null);

    const currentDate = useMemo(() => {
        const now = new Date();

        const monthStr = now.toLocaleString('fr-FR', {
            month: 'long',
        });

        return {
            day: now.getDate(),
            month:
                monthStr.charAt(0).toUpperCase() +
                monthStr.slice(1),
        };
    }, []);

    const balance = dashboard?.balance ?? 0;
    const income = dashboard?.income ?? 0;
    const expense = dashboard?.expense ?? 0;

    const saving =
        dashboard?.saving ??
        income - expense;

    const formatAmount = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 2,
        }).format(Number(value));
    };

    /*
    |--------------------------------------------------------------------------
    | CHARTS
    |--------------------------------------------------------------------------
    */

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

            const monthly =
                dashboard.monthly ?? [];

            const categories =
                dashboard.categories ?? [];

            /*
            |--------------------------------------------------------------------------
            | FLOW CHART
            |--------------------------------------------------------------------------
            */

            if (flowRef.current) {
                const lastMonths = [...monthly]
                    .sort((a, b) =>
                        a.month.localeCompare(b.month)
                    )
                    .slice(-6);

                const monthLabels =
                    lastMonths.map((item) => {
                        const date = new Date(
                            `${item.month}-01T00:00:00`
                        );

                        return date.toLocaleString(
                            'fr-FR',
                            {
                                month: 'short',
                            }
                        );
                    });

                const incomeData =
                    lastMonths.map((item) =>
                        Number(item.income)
                    );

                const expenseData =
                    lastMonths.map((item) =>
                        Number(item.expense)
                    );

                flowChart = new Chart(
                    flowRef.current,
                    {
                        type: 'bar',

                        data: {
                            labels: monthLabels,

                            datasets: [
                                {
                                    label: 'Revenus',

                                    data: incomeData,

                                    backgroundColor:
                                        PURPLE,

                                    borderRadius: 4,

                                    barPercentage: 0.5,
                                },

                                {
                                    label: 'Dépenses',

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
                                        label: (
                                            context
                                        ) => {
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

                                        callback: (
                                            value
                                        ) =>
                                            `${(
                                                Number(value) /
                                                1000
                                            ).toFixed(0)}k Ar`,
                                    },

                                    border: {
                                        display: false,
                                    },
                                },
                            },
                        },
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | DOUGHNUT CHART
            |--------------------------------------------------------------------------
            */

            if (pieRef.current) {
                const categoryLabels =
                    categories.map(
                        (category) =>
                            category.name
                    );

                const categoryValues =
                    categories.map(
                        (category) =>
                            Number(category.amount)
                    );

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

                pieChart = new Chart(
                    pieRef.current,
                    {
                        type: 'doughnut',

                        data: {
                            labels:
                                categoryLabels,

                            datasets: [
                                {
                                    data:
                                        categoryValues,

                                    backgroundColor:
                                        categoryValues.map(
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
                                        label: (
                                            context
                                        ) => {
                                            const value =
                                                Number(
                                                    context.raw
                                                );

                                            return `${context.label}: ${formatAmount(
                                                value
                                            )} Ar`;
                                        },
                                    },
                                },
                            },
                        },
                    }
                );
            }
        };

        loadChart();

        return () => {
            if (flowChart) {
                flowChart.destroy();
            }

            if (pieChart) {
                pieChart.destroy();
            }
        };
    }, [dashboard]);

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />

                    Chargement du dashboard...
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center max-w-sm shadow-xl">
                    <div className="text-red-500 font-semibold mb-1">
                        Une erreur est survenue
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Aperçu Financier
                    </h2>

                    <p className="text-xs text-gray-400">
                        Bienvenue, voici l'état de vos finances.
                    </p>
                </div>

                <div className="text-xs font-medium bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                    {currentDate.day}{' '}
                    {currentDate.month}
                </div>
            </header>

            {/* METRICS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {[
                    {
                        label: 'Solde Total',
                        value: balance,
                        color:
                            'text-gray-900 dark:text-white',
                    },

                    {
                        label: 'Revenus',
                        value: income,
                        color: 'text-emerald-500',
                    },

                    {
                        label: 'Dépenses',
                        value: expense,
                        color: 'text-rose-500',
                    },

                    {
                        label: 'Épargne / Restant',
                        value: saving,
                        color:
                            saving >= 0
                                ? 'text-purple-600'
                                : 'text-rose-500',
                    },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm"
                    >
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                            {card.label}
                        </span>

                        <div
                            className={`text-2xl font-bold mt-2 ${card.color}`}
                        >
                            {formatAmount(
                                card.value
                            )}

                            <span className="text-xs font-normal text-gray-400">
                                {' '}Ar
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* FLOW CHART */}

                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Flux de Trésorerie
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-400">

                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                Revenus
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                                Dépenses
                            </span>

                        </div>
                    </div>

                    <div className="h-60 relative w-full">
                        <canvas ref={flowRef} />
                    </div>

                </div>

                {/* PIE CHART */}

                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Répartition des Dépenses
                    </h3>

                    <div className="h-44 relative w-full my-auto">
                        <canvas ref={pieRef} />
                    </div>

                </div>
            </div>

            {/* TRANSACTIONS & BUDGET */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* RECENT TRANSACTIONS */}

                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        Dernières Transactions
                    </h3>

                    {dashboard?.transactions?.length > 0 ? (

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">

                            {dashboard.transactions
                                .slice(0, 5)
                                .map((transaction) => (

                                    <div
                                        key={transaction.id}
                                        className="py-3 flex items-center justify-between"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    transaction.type === 'income'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                                                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50'
                                                }`}
                                            >
                                                {transaction.type === 'income'
                                                    ? '+'
                                                    : '-'}
                                            </div>

                                            <div>

                                                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                                    {transaction.description ||
                                                        transaction.category ||
                                                        'Transaction'}
                                                </div>

                                                <div className="text-[10px] text-gray-400">
                                                    {transaction.date}
                                                </div>

                                            </div>
                                        </div>

                                        <div
                                            className={`text-xs font-bold ${
                                                transaction.type === 'income'
                                                    ? 'text-emerald-500'
                                                    : 'text-rose-500'
                                            }`}
                                        >
                                            {transaction.type === 'income'
                                                ? '+'
                                                : '-'}

                                            {formatAmount(
                                                transaction.amount
                                            )} Ar
                                        </div>

                                    </div>
                                ))}

                        </div>

                    ) : (

                        <div className="py-10 text-center text-xs text-gray-400">
                            Aucune transaction récente
                        </div>

                    )}

                </div>

                {/* BUDGET USAGE */}

                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        Utilisation du Budget
                    </h3>

                    {dashboard?.budgets?.length > 0 ? (

                        <div className="space-y-4">

                            {dashboard.budgets.map(
                                (budget) => {

                                    const spent =
                                        Number(
                                            budget.spent
                                        );

                                    const total =
                                        Number(
                                            budget.total
                                        );

                                    const percentage =
                                        total > 0
                                            ? (
                                                spent /
                                                total
                                            ) * 100
                                            : 0;

                                    const progressColor =
                                        percentage >= 100
                                            ? 'bg-rose-500'
                                            : percentage >= 80
                                                ? 'bg-amber-500'
                                                : 'bg-purple-500';

                                    return (
                                        <div
                                            key={
                                                budget.category
                                            }
                                        >

                                            <div className="flex justify-between text-xs mb-1 font-medium">

                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {budget.icon}{' '}
                                                    {
                                                        budget.category
                                                    }
                                                </span>

                                                <span className="text-gray-900 dark:text-white">
                                                    {formatAmount(
                                                        spent
                                                    )}
                                                    {' / '}
                                                    {formatAmount(
                                                        total
                                                    )} Ar
                                                </span>

                                            </div>

                                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">

                                                <div
                                                    className={`h-full ${progressColor} rounded-full transition-all duration-300`}
                                                    style={{
                                                        width: `${Math.min(
                                                            percentage,
                                                            100
                                                        )}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="py-10 text-center text-xs text-gray-400">
                            Aucun budget configuré
                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Dashboard;