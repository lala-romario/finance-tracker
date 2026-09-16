import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import Theme from '../components/dark.mode';

const GOAL_ICONS = {
  Épargne: '🛡️',
  Voyage: '🏖️',
  Achat: '💻',
  Moto: '🛵',
  Urgence: '🚨',
  Projet: '🚀',
  Autre: '🎯',
};

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: 0,
    category: 'Épargne',
    deadline: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      const data = Array.isArray(res.data) ? res.data : res.data.goals || [];
      setGoals(data);
    } catch (err) {
      console.error('Erreur chargement objectifs:', err);
      // Fallback avec données d'exemple si l'API n'est pas encore prête
      setGoals([
        {
          id: 1,
          title: 'Fonds de sécurité',
          targetAmount: 2000000,
          currentAmount: 850000,
          category: 'Urgence',
          deadline: '2026-12-31',
        },
        {
          id: 2,
          title: 'Nouvelle configuration dev',
          targetAmount: 3500000,
          currentAmount: 1200000,
          category: 'Achat',
          deadline: '2027-03-31',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Création d'un nouvel objectif
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return;

    try {
      const res = await api.post('/goals', newGoal);
      const created = res.data.goal || res.data || { ...newGoal, id: Date.now() };
      setGoals((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: 0,
        category: 'Épargne',
        deadline: '',
      });
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      // Fallback local en cas d'erreur API
      setGoals((prev) => [...prev, { ...newGoal, id: Date.now(), targetAmount: Number(newGoal.targetAmount), currentAmount: Number(newGoal.currentAmount) || 0 }]);
      setShowAddModal(false);
    }
  };

  // Ajouter de l'épargne sur un objectif
  const handleAddDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;

    const amt = Number(depositAmount);
    try {
      await api.patch(`/goals/${depositGoalId}/deposit`, { amount: amt });
      setGoals((prev) =>
        prev.map((g) => (g.id === depositGoalId ? { ...g, currentAmount: Number(g.currentAmount) + amt } : g))
      );
    } catch (err) {
      // Fallback local
      setGoals((prev) =>
        prev.map((g) => (g.id === depositGoalId ? { ...g, currentAmount: Number(g.currentAmount) + amt } : g))
      );
    } finally {
      setDepositGoalId(null);
      setDepositAmount('');
    }
  };

  // Suppression d'un objectif
  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  // Statistiques globales des objectifs
  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalCurrent = 0;

    goals.forEach((g) => {
      totalTarget += Number(g.targetAmount) || 0;
      totalCurrent += Number(g.currentAmount) || 0;
    });

    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

    return { totalTarget, totalCurrent, overallProgress };
  }, [goals]);

  const formatAmount = (val) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(val));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          Chargement de vos objectifs...
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
              <span>🎯</span> Objectifs d'Épargne
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Planifiez vos projets financiers et suivez votre progression en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouvel Objectif
            </button>
          </div>
        </div>

        {/* CARTE BILAN GLOBAL */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Progression Totale</span>
              <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {formatAmount(summary.totalCurrent)} Ar <span className="text-xs text-gray-400 font-normal">/ {formatAmount(summary.totalTarget)} Ar</span>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {summary.overallProgress}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${summary.overallProgress}%` }}
            />
          </div>
        </div>

        {/* GRILLE DES OBJECTIFS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount) || 0;
            const target = Number(goal.targetAmount) || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl">
                        {GOAL_ICONS[goal.category] || '🎯'}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                        <span className="text-[10px] text-gray-400 font-medium">{goal.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-gray-400">{formatAmount(current)} Ar</span>
                      <span className="text-gray-900 dark:text-white">{formatAmount(target)} Ar</span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-purple-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-gray-400">
                    {goal.deadline ? `Échéance: ${new Date(goal.deadline).toLocaleDateString('fr-FR')}` : 'Pas d\'échéance'}
                  </div>

                  <button
                    onClick={() => setDepositGoalId(goal.id)}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-bold rounded-lg text-[11px] transition-colors"
                  >
                    + Épargner
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL CREATION OBJECTIF */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddGoal} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Créer un Objectif</h3>

            <div>
              <label className="text-[10px] font-semibold text-gray-400">TITRE DE L'OBJECTIF</label>
              <input
                type="text"
                required
                placeholder="ex: Scooter, Voyage, Macbook..."
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400">MONTANT CIBLE (AR)</label>
                <input
                  type="number"
                  required
                  placeholder="2000000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400">DÉJÀ ÉPARGNÉ (AR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400">CATÉGORIE</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  {Object.keys(GOAL_ICONS).map((cat) => (
                    <option key={cat} value={cat}>{GOAL_ICONS[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400">ÉCHÉANCE</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL AJOUTER UNE ÉPARGNE */}
      {depositGoalId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddDeposit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Ajouter un Versement</h3>
            
            <div>
              <label className="text-[10px] font-semibold text-gray-400">MONTANT À AJOUTER (AR)</label>
              <input
                type="number"
                required
                autoFocus
                placeholder="100000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDepositGoalId(null)}
                className="flex-1 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20"
              >
                Valider
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default Goals;