import { useEffect, useMemo, useRef } from 'react';

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
        const monthStr = now.toLocaleString('fr-FR', { month: 'long' });

        return {
            day: now.getDate(),
            month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1),
        };
    }, []);

    const balance = dashboard?.balance ?? 0;
    const income = dashboard?.income ?? 0;
    const expense = dashboard?.expense ?? 0;
    const saving = dashboard?.saving ?? (income - expense);

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
        if (typeof window === 'undefined' || !dashboard) {
            return;
        }

        let flowChart = null;
        let pieChart = null;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
            const textColor = '#888780';

            const monthly = dashboard.monthly ?? [];
            const categories = dashboard.categories ?? [];

            /* FLOW CHART */
            if (flowRef.current) {
                // Détruire une instance existante sur le canvas si présente
                const existingFlowChart = Chart.getChart(flowRef.current);
                if (existingFlowChart) existingFlowChart.destroy();

                const lastMonths = [...monthly]
                    .sort((a, b) => a.month.localeCompare(b.month))
                    .slice(-6);

                const monthLabels = lastMonths.map((item) => {
                    const date = new Date(`${item.month}-01T00:00:00`);
                    return date.toLocaleString('fr-FR', { month: 'short' });
                });

                const incomeData = lastMonths.map((item) => Number(item.income));
                const expenseData = lastMonths.map((item) => Number(item.expense));

                flowChart = new Chart(flowRef.current, {
                    type: 'bar',
                    data: {
                        labels: monthLabels,
                        datasets: [
                            {
                                label: 'Revenus',
                                data: incomeData,
                                backgroundColor: PURPLE,
                                borderRadius: 4,
                                barPercentage: 0.6,
                            },
                            {
                                label: 'Dépenses',
                                data: expenseData,
                                backgroundColor: isDark ? '#3C3489' : '#CECBF6',
                                borderRadius: 4,
                                barPercentage: 0.6,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.dataset.label}: ${formatAmount(context.raw)} Ar`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    color: textColor,
                                    font: { size: 10 },
                                },
                            },
                            y: {
                                beginAtZero: true,
                                grid: { color: gridColor },
                                ticks: {
                                    color: textColor,
                                    font: { size: 10 },
                                    callback: (value) => `${(Number(value) / 1000).toFixed(0)}k Ar`,
                                },
                                border: { display: false },
                            },
                        },
                    },
                });
            }

            /* DOUGHNUT CHART */
            if (pieRef.current) {
                // Détruire une instance existante sur le canvas si présente
                const existingPieChart = Chart.getChart(pieRef.current);
                if (existingPieChart) existingPieChart.destroy();

                const categoryLabels = categories.map((c) => c.name);
                const categoryValues = categories.map((c) => Number(c.amount));
                const categoryColors = [
                    PURPLE, TEAL, '#EF9F27', RED, '#5DCAA5',
                    '#AFA9EC', '#D85C5C', '#6B9AC4', '#8B6FB8', '#D4A72C',
                ];

                pieChart = new Chart(pieRef.current, {
                    type: 'doughnut',
                    data: {
                        labels: categoryLabels,
                        datasets: [
                            {
                                data: categoryValues,
                                backgroundColor: categoryValues.map((_, i) => categoryColors[i % categoryColors.length]),
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
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${context.label}: ${formatAmount(context.raw)} Ar`,
                                },
                            },
                        },
                    },
                });
            }
        };

        loadChart();

        return () => {
            if (flowChart) flowChart.destroy();
            if (pieChart) pieChart.destroy();
        };
    }, [dashboard]);

    /* STATES LOADING / ERROR */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                    Chargement du dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] px-4">
                <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 text-center w-full max-w-sm shadow-xl">
                    <div className="text-red-500 font-semibold mb-1">Une erreur est survenue</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">

            {/* HEADER */}
            <header className="flex flex-row items-center justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                        Aperçu Financier
                    </h2>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                        Voici l'état de vos finances.
                    </p>
                </div>

                <div className="text-[11px] sm:text-xs font-medium bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                    {currentDate.day} {currentDate.month}
                </div>
            </header>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                {[
                    { label: 'Solde Total', value: balance, color: 'text-gray-900 dark:text-white' },
                    { label: 'Revenus', value: income, color: 'text-emerald-500' },
                    { label: 'Dépenses', value: expense, color: 'text-rose-500' },
                    { label: 'Épargne / Restant', value: saving, color: saving >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-500' },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between min-w-0"
                    >
                        <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate block">
                            {card.label}
                        </span>
                        <div className={`text-base sm:text-2xl font-bold mt-1 sm:mt-2 truncate ${card.color}`}>
                            {formatAmount(card.value)}
                            <span className="text-[10px] sm:text-xs font-normal text-gray-400"> Ar</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                
                {/* FLOW CHART */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm min-w-0">
                    <div className="flex flex-row items-center justify-between gap-2 mb-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                            Flux de Trésorerie
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 shrink-0">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                Revenus
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                                Dépenses
                            </span>
                        </div>
                    </div>
                    <div className="h-48 sm:h-60 relative w-full min-w-0">
                        <canvas ref={flowRef} />
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 truncate">
                        Répartition des Dépenses
                    </h3>
                    <div className="h-40 sm:h-44 relative w-full min-w-0 my-auto">
                        <canvas ref={pieRef} />
                    </div>
                </div>
            </div>

            {/* TRANSACTIONS & BUDGET GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
                
                {/* RECENT TRANSACTIONS */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 truncate">
                        Dernières Transactions
                    </h3>

                    {dashboard?.transactions?.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {dashboard.transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0">
                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                        <div
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                transaction.type === 'income'
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                                                    : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50'
                                            }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                {transaction.description || transaction.category || 'Transaction'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 truncate">
                                                {transaction.date}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`text-xs font-bold shrink-0 ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount)} Ar
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-gray-400">
                            Aucune transaction récente
                        </div>
                    )}
                </div>

                

            </div>
        </div>
    );
}

export default Dashboard;