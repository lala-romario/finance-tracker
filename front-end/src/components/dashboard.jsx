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
    const notifRef = useRef(null);

    const [showNotifications, setShowNotifications] = useState(false);

    // État des notifications
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setNotificationsLoading(true);

                const response = await api.get('/notifications');

                setNotifications(response.data);
            } catch (error) {
                console.error(
                    'Erreur lors du chargement des notifications :',
                    error
                );
            } finally {
                setNotificationsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Marquer une notification spécifique comme lue
    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(
                'Erreur lors du marquage de la notification :',
                error
            );
        }
    };

    // Marquer TOUTES les notifications comme lues
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            await api.patch('/notifications/read-all');

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );
        } catch (error) {
            console.error(
                'Erreur lors du marquage de toutes les notifications :',
                error
            );
        }
    };

    // Supprimer une notification spécifique
    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();

        try {
            await api.delete(`/notifications/${id}`);

            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
            );
        } catch (error) {
            console.error(
                'Erreur lors de la suppression de la notification :',
                error
            );
        }
    };

    // Nombre de notifications non lues
    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    // Fermeture du menu au clic à l'extérieur
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const formatNotificationTime = (date) => {
        if (!date) {
            return '';
        }

        const notificationDate = new Date(date);
        const now = new Date();

        const diffMs = now - notificationDate;
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 1) {
            return "À l'instant";
        }

        if (diffMinutes < 60) {
            return `Il y a ${diffMinutes} min`;
        }

        const diffHours = Math.floor(diffMinutes / 60);

        if (diffHours < 24) {
            return `Il y a ${diffHours}h`;
        }

        const diffDays = Math.floor(diffHours / 24);

        if (diffDays === 1) {
            return 'Hier';
        }

        if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        }

        return notificationDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    };

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

                <div className="flex items-center gap-2 shrink-0">
                    {/* BOUTON ET DROPDOWN NOTIFICATION */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors focus:outline-none"
                            aria-label="Notifications"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>

                            {/* Pastille Violette si non lue */}
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white dark:ring-gray-900" />
                            )}
                        </button>

                        {/* DROPDOWN */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-50">
                                {/* EN-TÊTE DROPDOWN AVEC LE BOUTON */}
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-medium px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* BOUTON TOUT MARQUER COMME LU */}
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={unreadCount === 0}
                                        className={`text-[11px] font-medium transition-colors ${unreadCount > 0
                                            ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline cursor-pointer'
                                            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        Tout marquer comme lu
                                    </button>
                                </div>

                                {/* LISTE DES NOTIFICATIONS */}
                                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {notificationsLoading ? (
                                        <div className="px-4 py-6 text-center text-xs text-gray-400">
                                            Chargement des notifications...
                                        </div>
                                    ) : notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => !n.read && handleMarkAsRead(n.id)}
                                                className={`group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-3 cursor-pointer ${!n.read
                                                        ? 'bg-purple-50/40 dark:bg-purple-950/20'
                                                        : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div
                                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read
                                                                ? 'bg-purple-600'
                                                                : 'bg-transparent'
                                                            }`}
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`text-xs ${!n.read
                                                                    ? 'text-gray-900 dark:text-white font-semibold'
                                                                    : 'text-gray-500 dark:text-gray-400 font-normal'
                                                                } leading-snug`}
                                                        >
                                                            {n.title}
                                                        </p>

                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                            {n.message}
                                                        </p>

                                                        <span className="text-[10px] text-gray-400 block mt-0.5">
                                                            {formatNotificationTime(n.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) =>
                                                        handleDeleteNotification(e, n.id)
                                                    }
                                                    className="p-1 text-gray-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                                                    title="Supprimer la notification"
                                                    aria-label="Supprimer"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-6 text-center text-xs text-gray-400">
                                            Aucune notification
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BLOC DATE */}
                    <div className="text-[11px] sm:text-xs font-medium bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                        {currentDate.day} {currentDate.month}
                    </div>
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
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${transaction.type === 'income'
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