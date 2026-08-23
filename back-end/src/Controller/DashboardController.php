<?php

namespace App\Controller;

use App\Entity\Transaction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class DashboardController extends AbstractController
{  
    #[Route('/api/dashboard', name: 'api_dashboard', methods: ['GET'])]
    public function index(
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse([
                'error' => 'User not authenticated.'
            ], 401);
        }

        /*
         * ---------------------------------------------------------
         * 1. Récupérer toutes les transactions de l'utilisateur
         * ---------------------------------------------------------
         */

        $transactions = $entityManager
            ->getRepository(Transaction::class)
            ->findBy(
                ['owner' => $user],
                ['transactionDate' => 'DESC']
            );

        /*
         * ---------------------------------------------------------
         * 2. Définir le mois actuel
         * ---------------------------------------------------------
         */

        $now = new \DateTimeImmutable();

        $currentMonthStart = $now->modify('first day of this month')->setTime(0, 0, 0);

        $nextMonthStart = $currentMonthStart->modify('+1 month');

        /*
         * ---------------------------------------------------------
         * 3. Variables du mois actuel
         * ---------------------------------------------------------
         */

        $currentIncome = 0.0;
        $currentExpense = 0.0;

        /*
         * ---------------------------------------------------------
         * 4. Variables pour les statistiques mensuelles
         * ---------------------------------------------------------
         *
         * Exemple :
         *
         * 2026-06
         * 2026-07
         * 2026-08
         */

        $monthlyData = [];

        /*
         * ---------------------------------------------------------
         * 5. Parcourir les transactions
         * ---------------------------------------------------------
         */

        foreach ($transactions as $transaction) {

            $amount = (float) $transaction->getAmount();

            $date = $transaction->getTransactionDate();

            if (!$date) {
                continue;
            }

            /*
             * -----------------------------------------------------
             * Mois de la transaction
             * -----------------------------------------------------
             */

            $monthKey = $date->format('Y-m');

            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $monthKey,
                    'income' => 0.0,
                    'expense' => 0.0,
                    'remaining' => 0.0,
                ];
            }

            /*
             * -----------------------------------------------------
             * Income
             * -----------------------------------------------------
             */

            if ($transaction->getType() === 'income') {

                $monthlyData[$monthKey]['income'] += $amount;

                /*
                 * Si la transaction appartient au mois actuel
                 */
                if (
                    $date >= $currentMonthStart &&
                    $date < $nextMonthStart
                ) {
                    $currentIncome += $amount;
                }
            }

            /*
             * -----------------------------------------------------
             * Expense
             * -----------------------------------------------------
             */

            if ($transaction->getType() === 'expense') {

                $monthlyData[$monthKey]['expense'] += $amount;

                /*
                 * Si la transaction appartient au mois actuel
                 */
                if (
                    $date >= $currentMonthStart &&
                    $date < $nextMonthStart
                ) {
                    $currentExpense += $amount;
                }
            }
        }

        /*
         * ---------------------------------------------------------
         * 6. Calculer le reste de chaque mois
         * ---------------------------------------------------------
         */

        foreach ($monthlyData as &$month) {
            $month['remaining'] =
                $month['income'] - $month['expense'];
        }

        unset($month);

        /*
         * ---------------------------------------------------------
         * 7. Trier les mois du plus récent au plus ancien
         * ---------------------------------------------------------
         */

        krsort($monthlyData);

        /*
         * ---------------------------------------------------------
         * 8. Calculer le solde du mois actuel
         * ---------------------------------------------------------
         */

        $balance = $currentIncome - $currentExpense;

        /*
         * ---------------------------------------------------------
         * 9. Calculer l'épargne cumulée
         * ---------------------------------------------------------
         *
         * Exemple :
         *
         * Août     +150 000
         * Juillet  +200 000
         *
         * Saving = 350 000
         *
         * On additionne uniquement les mois jusqu'au mois actuel.
         */

        $saving = 0.0;

        foreach ($monthlyData as $month) {

            $monthDate = \DateTimeImmutable::createFromFormat(
                'Y-m-d',
                $month['month'] . '-01'
            );

            if (!$monthDate) {
                continue;
            }

            if ($monthDate <= $currentMonthStart) {
                $saving += $month['remaining'];
            }
        }

        /*
         * ---------------------------------------------------------
         * 10. Préparer les transactions pour le frontend
         * ---------------------------------------------------------
         */

        $transactionData = [];

        foreach ($transactions as $transaction) {

            $transactionData[] = [
                'id' => $transaction->getId(),
                'amount' => $transaction->getAmount(),
                'type' => $transaction->getType(),
                'description' => $transaction->getDescription(),
                'date' => $transaction->getTransactionDate()?->format('Y-m-d'),
                'category' => $transaction->getCategory()?->getName(),
            ];
        }

        /*
         * ---------------------------------------------------------
         * 11. Réponse JSON
         * ---------------------------------------------------------
         */

        return new JsonResponse([
            'balance' => $balance,
            'income' => $currentIncome,
            'expense' => $currentExpense,
            'saving' => $saving,

            'transactions' => $transactionData,

            'monthly' => array_values($monthlyData),
        ]);
    }
}