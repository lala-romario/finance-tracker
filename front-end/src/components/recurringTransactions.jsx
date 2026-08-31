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

const FREQUENCY_LABELS = {
  monthly: 'Mensuel',
  weekly: 'Hebdomadaire',
  yearly: 'Annuel',
};

function RecurringTransactions() {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);

  // States Modals & Form
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Abonnements',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().slice(0, 10),
    active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recurring-transactions');
      const data = Array.isArray(res.data) ? res.data : res.data.recurring || [];
      setRecurring(data);
    } catch (err) {
      console.error('Erreur chargement récurrences:', err);
      setRecurring([
        {
          id: 1,
          title: 'Abonnement Netflix / Spotify',
          amount: 45000,
          type: 'expense',
          category: 'Abonnements',
          frequency: 'monthly',
          nextDueDate: '2026-09-05',
          active: true,
        },
        {
          id: 2,
          title: 'Loyer Appartement',
          amount: 600000,
          type: 'expense',
          category: 'Logement',
          frequency: 'monthly',
          nextDueDate: '2026-09-01',
          active: true,
        },
        {
          id: 3,
          title: 'Salaire fixe',
          amount: 2500000,
          type: 'income',
          category: 'Salaire',
          frequency: 'monthly',
          nextDueDate: '2026-09-30',
          active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ouvrir la modal en mode création
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: 'Abonnements',
      frequency: 'monthly',
      nextDueDate: new Date().toISOString().slice(0, 10),
      active: true,
    });
    setShowFormModal(true);
  };

  // Ouvrir la modal en mode édition
  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      amount: item.amount || '',
      type: item.type || 'expense',
      category: item.category || 'Abonnements',
      frequency: item.frequency || 'monthly',
      nextDueDate: item.nextDueDate ? item.nextDueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      active: item.active ?? true,
    });
    setShowFormModal(true);
  };

  // Soumission unique (Création ou Édition)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const payload = { ...formData, amount: Number(formData.amount) };

    if (editingId) {
      // Édition
      try {
        const res = await api.put(`/recurring-transactions/${editingId}`, payload);
        const updated = res.data.recurring || res.data || { ...payload, id: editingId };
        setRecurring((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      } catch (err) {
        setRecurring((prev) => prev.map((r) => (r.id === editingId ? { ...payload, id: editingId } : r)));
      }
    } else {
      // Création
      try {
        const res = await api.post('/recurring-transactions', payload);
        const created = res.data.recurring || res.data || { ...payload, id: Date.now() };
        setRecurring((prev) => [created, ...prev]);
      } catch (err) {
        setRecurring((prev) => [{ ...payload, id: Date.now() }, ...prev]);
      }
    }

    setShowFormModal(false);
  };

  const toggleActive = async (id) => {
    const item = recurring.find((r) => r.id === id);
    if (!item) return;

    try {
      await api.patch(`/recurring-transactions/${id}`, { active: !item.active });
    } catch (err) {
      console.error('Erreur toggle statut:', err);
    } finally {
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/recurring-transactions/${deleteId}`);
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setRecurring((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  const monthlySummary = useMemo(() => {
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    recurring.forEach((r) => {
      if (!r.active) return;
      let amt = Number(r.amount) || 0;

      if (r.frequency === 'weekly') amt = amt * 4.33;
      if (r.frequency === 'yearly') amt = amt / 12;

      if (r.type === 'income') {
        monthlyIncome += amt;
      } else {
        monthlyExpense += amt;
      }
    });

    return {
      monthlyIncome,
      monthlyExpense,
      netBalance: monthlyIncome - monthlyExpense,
    };
  }, [recurring]);

  const formatAmount = (val) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(val));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          Chargement de vos récurrences...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>🔄</span> Transactions Récurrentes
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Gérez vos abonnements, charges fixes et entrées régulières.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Theme />
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle Récurrence
            </button>
          </div>
        </div>

        {/* BILAN MENSUEL ESTIMÉ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Entrées Fixes Estimées / mois</span>
            <div className="text-xl font-extrabold text-emerald-500 mt-1">
              +{formatAmount(monthlySummary.monthlyIncome)} Ar
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Charges Fixes Estimées / mois</span>
            <div className="text-xl font-extrabold text-rose-500 mt-1">
              -{formatAmount(monthlySummary.monthlyExpense)} Ar
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Solde Récurrent / mois</span>
            <div className={`text-xl font-extrabold mt-1 ${monthlySummary.netBalance >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-500'}`}>
              {formatAmount(monthlySummary.netBalance)} Ar
            </div>
          </div>
        </div>

        {/* TABLEAU */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Titre & Catégorie</th>
                  <th className="py-3.5 px-4">Fréquence</th>
                  <th className="py-3.5 px-4">Prochaine Échéance</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Montant</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {recurring.length > 0 ? (
                  recurring.map((item) => {
                    const isIncome = item.type === 'income';
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors ${!item.active ? 'opacity-50' : ''}`}>
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[item.category] || '📦'}</span>
                            <div>
                              <div>{item.title}</div>
                              <div className="text-[10px] text-gray-400 font-normal">{item.category}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold">
                            {FREQUENCY_LABELS[item.frequency] || item.frequency}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                          {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString('fr-FR') : '-'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleActive(item.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                              item.active
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                            }`}
                          >
                            {item.active ? 'Actif' : 'Inactif'}
                          </button>
                        </td>

                        <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                          {isIncome ? '+' : '-'}{formatAmount(item.amount)} Ar
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Bouton Éditer */}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Bouton Supprimer */}
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400 text-xs">
                      Aucune transaction récurrente configurée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* MODAL UNIQUE CREATION / EDITING */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingId ? 'Modifier la Récurrence' : 'Nouvelle Récurrence'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 text-xs font-bold rounded-xl border ${formData.type === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-500 dark:bg-rose-950/40' : 'border-gray-200 dark:border-gray-800'}`}
              >
                Dépense fixe
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2 text-xs font-bold rounded-xl border ${formData.type === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-500 dark:bg-emerald-950/40' : 'border-gray-200 dark:border-gray-800'}`}
              >
                Revenu fixe
              </button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-400">TITRE</label>
              <input
                type="text"
                required
                placeholder="ex: Loyer, Netflix, Salaire..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400">MONTANT (AR)</label>
                <input
                  type="number"
                  required
                  placeholder="45000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400">FRÉQUENCE</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400">CATÉGORIE</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  {Object.keys(CATEGORY_ICONS).map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400">PROCHAINE ÉCHÉANCE</label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 duration-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 cursor-pointer duration-500"
              >
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            <p className="text-xs text-gray-500">Êtes-vous sûr de vouloir supprimer cette récurrence ?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded-xl">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl shadow-md shadow-rose-600/20">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RecurringTransactions;