import { useEffect, useRef, useState } from 'react';
import Button from '../components/AddIncomeButton';

const PURPLE = '#7F77DD';
const PURPLE_DARK = '#534AB7';
const PURPLE_LIGHT = '#EEEDFE';
const TEAL = '#1D9E75';
const RED = '#E24B4A';



const handleIncome = () => {
    console.log('napiditra vola zay')
};

function Dashboard() {
    const flowRef = useRef(null);
    const pieRef = useRef(null);

    {/*code pour prendre le moi et faire majuscule le premier lettre*/}
    const month = new Date().toLocaleString('fr-FR', { month: 'long' });
    const Month = month.charAt(0).toUpperCase() + month.slice(1)
    const day = new Date().getDate()

    const balance = 0;
    const income = 0;
    const expense = 0;
    const saving = 0;
    

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
            const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
            const textColor = '#888780';

            // Flow chart
            if (flowRef.current) {
                new Chart(flowRef.current, {
                    type: 'bar',
                    data: {
                        labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [
                            {
                                label: 'Income',
                                data: [3800, 3900, 4000, 3700, 3900, 4200],
                                backgroundColor: PURPLE,
                                borderRadius: 4,
                                barPercentage: 0.5,
                            },
                            {
                                label: 'Expenses',
                                data: [2400, 2600, 2300, 2800, 2570, 2750],
                                backgroundColor: isDark ? '#3C3489' : '#CECBF6',
                                borderRadius: 4,
                                barPercentage: 0.5,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { color: textColor, font: { size: 11 } },
                            },
                            y: {
                                grid: { color: gridColor },
                                ticks: {
                                    color: textColor,
                                    font: { size: 11 },
                                    callback: (v) => '$' + (v / 1000).toFixed(1) + 'k',
                                },
                                border: { display: false },
                            },
                        },
                    },
                });
            }

            // Pie chart
            if (pieRef.current) {
                new Chart(pieRef.current, {
                    type: 'doughnut',
                    data: {
                        labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Savings'],
                        datasets: [
                            {
                                data: [950, 340, 180, 210, 90, 1450],
                                backgroundColor: [PURPLE, TEAL, '#EF9F27', RED, '#5DCAA5', '#AFA9EC'],
                                borderWidth: 0,
                                hoverOffset: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: { legend: { display: false } },
                    },
                });
            }
        };

        loadChart();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: PURPLE }}>
                        {/* icon placeholder */}
                        <span className="text-white text-xs">FT</span>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Finance Tracker</div>
                        <div className="text-[11px] text-gray-400">Manage your money smarter</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="text-[11px] px-3 py-1 rounded-full border mr-2"
                        style={{ background: PURPLE_LIGHT, color: PURPLE_DARK, borderColor: '#AFA9EC' }}
                    >
                        { day } { Month }
                    </span>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border"
                        style={{ background: PURPLE_LIGHT, color: PURPLE_DARK, borderColor: '#AFA9EC' }}
                    >
                        JD
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                    { label: 'Solde', value: balance, change: '+2.4% this month', up: true },
                    { label: 'Revenus', value: income, change: '+$300 vs last', up: true },
                    { label: 'Depenses', value: expense, change: '+$180 vs last', up: false },
                    { label: 'Economies', value: saving, change: '34% rate', up: true },
                ].map((m) => (
                    <div key={m.label} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{m.label}</div>
                        <div className="text-xl font-medium text-gray-900 dark:text-white">{m.value}</div>
                        <div className={`text-[11px] mt-1 ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>
                            {m.change}
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Button onClick={handleIncome} />
            </div>

            
            {/* actions button */}
            <div className="flex gap-2 mb-4">
                {[
                    { label: 'Add income', icon: '+', action: () => setShowIncome(showIncome) },
                    { label: 'Add expense', icon: '-', action: () => { } },
                    { label: 'Analysis', icon: '↗', action: () => { } },
                    { label: 'Export', icon: '↓', action: () => { } },
                ].map((a) => (
                    <button
                        key={a.label}
                        onClick={a.action}
                        className="flex-1 flex flex-col items-center gap-1 bg-white dark:bg-gray-800 rounded-lg py-2 px-1 text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-none"
                    >
                        <span className="text-lg font-medium" style={{ color: PURPLE }}>{a.icon}</span>
                        <span className="hidden sm:block">{a.label}</span>
                    </button>
                ))}
            </div>

            {/* Cash flow chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                <div className="text-[13px] font-medium text-gray-400 mb-3">Cash flow — last 6 months</div>
                <div className="flex gap-4 mb-3">
                    {[
                        { color: PURPLE, label: 'Income' },
                        { color: '#CECBF6', label: 'Expenses' },
                    ].map((l) => (
                        <span key={l.label} className="flex items-center gap-1 text-[12px] text-gray-400">
                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
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
                    <div className="text-[13px] font-medium text-gray-400 mb-3">Recent transactions</div>
                    {[
                        { icon: '💼', color: '#E1F5EE', iconColor: '#0F6E56', name: 'Salary', date: 'May 1', amount: '+$4,200', up: true },
                        { icon: '🏠', color: PURPLE_LIGHT, iconColor: PURPLE_DARK, name: 'Rent', date: 'May 2', amount: '-$950', up: false },
                        { icon: '🛒', color: '#FAEEDA', iconColor: '#854F0B', name: 'Groceries', date: 'May 5', amount: '-$124', up: false },
                        { icon: '📱', color: '#FBEAF0', iconColor: '#993556', name: 'Subscriptions', date: 'May 6', amount: '-$42', up: false },
                    ].map((t) => (
                        <div key={t.name} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-none">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                style={{ background: t.color }}
                            >
                                {t.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-gray-900 dark:text-white truncate">{t.name}</div>
                                <div className="text-[11px] text-gray-400 mr-2">{t.date}</div>
                            </div>
                            <div className={`text-[13px] font-medium shrink-0 ${t.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {t.amount}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Budget + Donut */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="text-[13px] font-medium text-gray-400 mb-3">Budget usage</div>
                    {[
                        { label: 'Housing', spent: 950, total: 1000, color: PURPLE },
                        { label: 'Food', spent: 340, total: 500, color: TEAL },
                        { label: 'Transport', spent: 180, total: 300, color: TEAL },
                        { label: 'Entertainment', spent: 210, total: 200, color: RED },
                        { label: 'Health', spent: 90, total: 150, color: TEAL },
                    ].map((b) => (
                        <div key={b.label} className="mb-3">
                            <div className="flex justify-between text-[12px] text-gray-400 mb-1">
                                <span>{b.label}</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    ${b.spent} / ${b.total}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min((b.spent / b.total) * 100, 100)}%`,
                                        background: b.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mt-3">
                        <div className="text-[12px] text-gray-400 mb-2">Spending by category</div>
                        <div className="relative h-28 w-full">
                            <canvas ref={pieRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;