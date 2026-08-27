import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import Theme from '../components/dark.mode';

const CATEGORY_ICONS = {
  Salaire: '💼',
  'Autres revenus': '💰',
  Alimentation: '🍔',
  Transport: '🚗',
  Logement: '🏠',
  Santé: '❤️',
  Loisirs: '🎮',
  Shopping: '🛍️',
  Bricolage: '🔨',
  'Matériel maison': '🛠️',
  Vacances: '🏖️',
  Abonnements: '📱',
  'Autres dépenses': '📦',
};

function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      const data = Array.isArray(res.data) ? res.data : res.data.transactions || [];
      setTransactions(data);
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError('Impossible de charger les données d’analyse.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.date) set.add(t.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtrage par mois (ou tout l'historique)
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter((t) => t.date?.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // ANLYSE APPRONFONDIE & RÉPONSES AUX QUESTIONS
  const insights = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let maxExpenseObj = null;
    let minExpenseObj = null;
    const catMap = {};
    const dateSet = new Set();

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.date) dateSet.add(t.date);

      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        catMap[t.category] = (catMap[t.category] || 0) + amt;

        if (!maxExpenseObj || amt > Number(maxExpenseObj.amount)) {
          maxExpenseObj = t;
        }
        if (!minExpenseObj || amt < Number(minExpenseObj.amount)) {
          minExpenseObj = t;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;
    const daysCount = dateSet.size || 1;
    const avgDailyExpense = Math.round(totalExpense / daysCount);

    // Tri des catégories par dépenses descendantes
    const categoriesArray = Object.keys(catMap)
      .map((cat) => ({
        name: cat,
        total: catMap[cat],
        percentage: totalExpense > 0 ? Math.round((catMap[cat] / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const topCategory = categoriesArray[0] || null;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      avgDailyExpense,
      daysCount,
      maxExpenseObj,
      topCategory,
      categoriesArray,
    };
  }, [filteredTransactions]);

  const formatAmount = (val) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(val));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          Calcul des analyses en cours...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER & FILTRE DU MOIS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Analyses & Insights
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Réponses automatiques et statistiques détaillées basées sur vos transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Theme />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Toutes les périodes</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* CARTES DE RÉPONSES RAPIDES AUX QUESTIONS CRUCIALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Q1: Taux d'épargne */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Taux d'Épargne</span>
              <span className="text-lg">📈</span>
            </div>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {insights.savingsRate}%
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Du revenu net conservé sur cette période.
            </p>
          </div>

          {/* Q2: Dépense moyenne / jour */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dépense Moy. / Jour</span>
              <span className="text-lg">🗓️</span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {formatAmount(insights.avgDailyExpense)} Ar
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Basé sur {insights.daysCount} jour(s) d'activité.
            </p>
          </div>

          {/* Q3: Plus gros poste dépense */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Top Post Dépenses</span>
              <span className="text-lg">🔥</span>
            </div>
            <div className="text-xl font-extrabold text-rose-500 truncate">
              {insights.topCategory ? `${CATEGORY_ICONS[insights.topCategory.name] || ''} ${insights.topCategory.name}` : 'Aucun'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {insights.topCategory ? `${insights.topCategory.percentage}% du budget total (${formatAmount(insights.topCategory.total)} Ar)` : 'Pas de dépenses'}
            </p>
          </div>

          {/* Q4: Plus grosse dépense ponctuelle */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plus Grosse Dépense</span>
              <span className="text-lg">💸</span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {insights.maxExpenseObj ? `${formatAmount(insights.maxExpenseObj.amount)} Ar` : '0 Ar'}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {insights.maxExpenseObj ? `${insights.maxExpenseObj.description || insights.maxExpenseObj.category}` : 'Aucune entrée'}
            </p>
          </div>

        </div>

        {/* SECTION DES QUESTIONS/RÉPONSES DÉTAILLÉES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Répartition par catégorie */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📊 Où passe votre argent ? (Répartition des Dépenses)
            </h2>

            {insights.categoriesArray.length > 0 ? (
              <div className="space-y-4 pt-2">
                {insights.categoriesArray.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {CATEGORY_ICONS[cat.name] || '📦'} {cat.name}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatAmount(cat.total)} Ar ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">Aucune dépense enregistrée pour la période choisie.</p>
            )}
          </div>

          {/* Résumé de santé financière */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              💡 Bilan de Santé Financière
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                <span className="text-gray-400 font-semibold text-[10px] uppercase">Revenus Totaux</span>
                <p className="text-base font-bold text-emerald-500">+{formatAmount(insights.totalIncome)} Ar</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                <span className="text-gray-400 font-semibold text-[10px] uppercase">Dépenses Totales</span>
                <p className="text-base font-bold text-rose-500">-{formatAmount(insights.totalExpense)} Ar</p>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-1">
                <span className="text-purple-600 dark:text-purple-400 font-semibold text-[10px] uppercase">Économies Nettes</span>
                <p className={`text-base font-bold ${insights.netBalance >= 0 ? 'text-purple-700 dark:text-purple-300' : 'text-rose-500'}`}>
                  {formatAmount(insights.netBalance)} Ar
                </p>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl">
              {insights.netBalance >= 0
                ? '🟢 Vos finances sont saines ! Vos revenus couvrent l\'ensemble de vos charges.'
                : '🔴 Attention : vos dépenses dépassent actuellement vos revenus enregistrés.'}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Analytics;