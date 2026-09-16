import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../api/axios';

const PRESET_QUESTIONS = [
  "Quel est le bilan de ce mois ?",
  "Où ai-je le plus dépensé ?",
  "Comment réduire mes dépenses ?",
  "Puis-je me permettre un achat imprévu ?",
];

function FinancialAssistant() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Bonjour Lala ! Je suis ton assistant financier. Analyse de tes comptes terminée. Pose-moi une question ou choisis une suggestion ci-dessous.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/transactions');
        const data = Array.isArray(res.data) ? res.data : res.data.transactions || [];
        setTransactions(data);
      } catch (err) {
        console.error('Erreur chargement transactions assistant:', err);
        setError("Impossible d'accéder aux données financières.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Analyse synthétique du contexte financier
  const context = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expense += amt;
        catMap[t.category] = (catMap[t.category] || 0) + amt;
      }
    });

    const net = income - expense;
    const sortedCats = Object.keys(catMap)
      .map((c) => ({ name: c, amount: catMap[c] }))
      .sort((a, b) => b.amount - a.amount);

    return { income, expense, net, topCategory: sortedCats[0] || null };
  }, [transactions]);

  const formatAmount = (val) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(val));

  // Générateur de réponses basées sur les règles financières
  const generateResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('bilan') || q.includes('résumé') || q.includes('mois')) {
      return `Ton bilan global affiche des revenus de **${formatAmount(context.income)} Ar** et des dépenses de **${formatAmount(context.expense)} Ar**. Ton solde disponible est de **${formatAmount(context.net)} Ar**.`;
    }

    if (q.includes('plus dépensé') || q.includes('poste') || q.includes('catégorie')) {
      if (!context.topCategory) return "Tu n'as enregistré aucune dépense pour l'instant.";
      return `Ton plus gros poste de dépense est **${context.topCategory.name}** avec un total de **${formatAmount(context.topCategory.amount)} Ar**.`;
    }

    if (q.includes('réduire') || q.includes('économiser') || q.includes('conseil')) {
      if (context.topCategory) {
        return `Pour optimiser ton budget, tu pourrais cibler la catégorie **${context.topCategory.name}** (${formatAmount(context.topCategory.amount)} Ar). Réduire cette charge de 10% te ferait économiser **${formatAmount(context.topCategory.amount * 0.1)} Ar**.`;
      }
      return "Essaie d'établir une limite mensuelle sur tes dépenses discrétionnaires comme les loisirs ou le shopping.";
    }

    if (q.includes('achat') || q.includes('imprévu') || q.includes('payer')) {
      if (context.net > 0) {
        return `Ton solde positif actuel est de **${formatAmount(context.net)} Ar**. Tu as de la marge, mais assure-toi de conserver une épargne de précaution.`;
      }
      return `Attention, tes dépenses actuelles égalent ou dépassent tes revenus enregistrés. Il vaut mieux reporter les achats non essentiels.`;
    }

    return `J'ai bien pris en compte ta demande. Actuellement, ton solde est de **${formatAmount(context.net)} Ar** et tes dépenses totales s'élèvent à **${formatAmount(context.expense)} Ar**. Que souhaites-tu analyser précisément ?`;
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    setTimeout(() => {
      const replyText = generateResponse(text);
      const assistantMsg = { id: Date.now() + 1, sender: 'assistant', text: replyText };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          Initialisation de l'assistant...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* BANNIÈRE DE DÉVELOPPEMENT */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-3 text-amber-800 dark:text-amber-300 shadow-xs">
        <span className="text-lg">🚧</span>
        <div className="text-xs">
          <span className="font-bold">Fonctionnalité en cours de développement :</span> Cette section est actuellement en cours de conception. Certaines fonctionnalités ou données affichées peuvent encore évoluer.
        </div>
      </div>

      {/* HEADER DE SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🤖</span> Assistant Financier
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Pose des questions sur tes transactions et obtiens des conseils sur mesure.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* CHAT CONTAINER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col h-[560px] overflow-hidden">
        
        {/* MESSAGES */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center justify-center mr-2.5 shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-bl-xs border border-gray-100 dark:border-gray-700/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTIONS */}
        <div className="px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl border border-purple-200/60 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 text-[11px] font-medium text-purple-600 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2 bg-white dark:bg-gray-900"
        >
          <input
            type="text"
            placeholder="Pose une question sur tes finances..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600/50 dark:focus:ring-purple-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] shrink-0"
          >
            <span>Envoyer</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

      </div>
    </div>
  );
}

export default FinancialAssistant;