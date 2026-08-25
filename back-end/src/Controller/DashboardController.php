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

        $currentMonthStart = $now
            ->modify('first day of this month')
            ->setTime(0, 0, 0);

        $nextMonthStart = $currentMonthStart
            ->modify('+1 month');

        /*
         * ---------------------------------------------------------
         * 3. Variables du mois actuel
         * ---------------------------------------------------------
         */

        $currentIncome = 0.0;
        $currentExpense = 0.0;

        /*
         * ---------------------------------------------------------
         * 4. Données mensuelles
         * ---------------------------------------------------------
         */

        $monthlyData = [];

        /*
         * ---------------------------------------------------------
         * 5. Dépenses par catégorie
         * ---------------------------------------------------------
         */

        $categoryData = [];

        /*
         * ---------------------------------------------------------
         * 6. Parcourir les transactions
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
             * Dépenses par catégorie
             * -----------------------------------------------------
             */

            if ($transaction->getType() === 'expense') {

                $category = $transaction->getCategory();

                if ($category) {

                    $categoryName = $category->getName();
                    $categoryIcon = $category->getIcon();

                    if (!isset($categoryData[$categoryName])) {

                        $categoryData[$categoryName] = [
                            'name' => $categoryName,
                            'icon' => $categoryIcon,
                            'amount' => 0.0,
                        ];
                    }

                    $categoryData[$categoryName]['amount'] += $amount;
                }
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
         * 7. Calculer le reste de chaque mois
         * ---------------------------------------------------------
         */

        foreach ($monthlyData as &$month) {

            $month['remaining'] =
                $month['income'] - $month['expense'];
        }

        unset($month);

        /*
         * ---------------------------------------------------------
         * 8. Trier les mois
         * ---------------------------------------------------------
         */

        krsort($monthlyData);

        /*
         * ---------------------------------------------------------
         * 9. Calculer le solde actuel
         * ---------------------------------------------------------
         */

        $balance = $currentIncome - $currentExpense;

        /*
         * ---------------------------------------------------------
         * 10. Calculer l'épargne cumulée
         * ---------------------------------------------------------
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
         * 11. Préparer les transactions
         * ---------------------------------------------------------
         */

        $transactionData = [];

        foreach ($transactions as $transaction) {

            $transactionData[] = [
                'id' => $transaction->getId(),
                'amount' => $transaction->getAmount(),
                'type' => $transaction->getType(),
                'description' => $transaction->getDescription(),
                'date' => $transaction
                    ->getTransactionDate()
                    ?->format('Y-m-d'),
                'category' => $transaction
                    ->getCategory()
                    ?->getName(),
            ];
        }

        /*
         * ---------------------------------------------------------
         * 12. Trier les catégories par montant décroissant
         * ---------------------------------------------------------
         */

        usort(
            $categoryData,
            fn (array $a, array $b) =>
                $b['amount'] <=> $a['amount']
        );

        /*
         * ---------------------------------------------------------
         * 13. Réponse JSON
         * ---------------------------------------------------------
         */

        return new JsonResponse([

            'balance' => $balance,

            'income' => $currentIncome,

            'expense' => $currentExpense,

            'saving' => $saving,

            'transactions' => $transactionData,

            'monthly' => array_values($monthlyData),

            'categories' => array_values($categoryData),
        ]);
    }
}