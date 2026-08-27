import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import Theme from '../components/dark.mode';

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

function Transactions() {
  // Global & API State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const transRes = await api.get('/transactions');

      const data = Array.isArray(transRes.data)
        ? transRes.data
        : transRes.data.transactions || [];
      
      setTransactions(data);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      setError('Impossible de charger la liste des transactions.');
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
      if (t.date) {
        const monthKey = t.date.substring(0, 7);
        set.add(monthKey);
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const categoryOptions = useMemo(() => {
    if (selectedType === 'income') return INCOME_CATEGORIES;
    if (selectedType === 'expense') return EXPENSE_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [selectedType]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth && !t.date?.startsWith(selectedMonth)) return false;
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const descMatch = t.description?.toLowerCase().includes(query);
        const catMatch = t.category?.toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }
      return true;
    });
  }, [transactions, selectedMonth, selectedType, selectedCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedType, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'Catégorie', 'Description', 'Montant (Ar)'];
    const rows = filteredTransactions.map((t) => [
      t.id || '',
      t.date || '',
      t.type === 'income' ? 'Revenu' : 'Dépense',
      `"${t.category || ''}"`,
      `"${t.description || ''}"`,
      t.amount || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAmount = (val) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2,
    }).format(Number(val));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          Chargement des transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 p-4 sm:p-6 lg:p-10">
      
      {/* CONTAINER PRINCIPAL */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Historique des Transactions</h1>
            <p className="text-xs text-gray-400 mt-1">Consultez, filtrez et exportez vos revenus et dépenses.</p>
          </div>

          <div className="flex items-center gap-3">
            <Theme />
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter (CSV)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-rose-500 text-xs">
            {error}
          </div>
        )}

        {/* FILTRES & RECHERCHE */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            >
              <option value="">Tous les mois</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedCategory('all');
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            >
              <option value="all">Tous les types</option>
              <option value="income">Revenus uniquement</option>
              <option value="expense">Dépenses uniquement</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            >
              <option value="all">Toutes les catégories</option>
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* TABLEAU DES TRANSACTIONS */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[420px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t) => {
                    const isIncome = t.type === 'income';
                    return (
                      <tr
                        key={t.id || Math.random()}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {t.category || 'Non spécifié'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                          {t.description || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              isIncome
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                            }`}
                          >
                            {isIncome ? 'Revenu' : 'Dépense'}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                            isIncome ? 'text-emerald-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatAmount(t.amount)} Ar
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 text-xs">
                      Aucune transaction ne correspond à vos critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER & PAGINATION */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div>
              {filteredTransactions.length} transaction(s) trouvée(s)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all"
              >
                Précédent
              </button>
              <span className="px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Transactions;