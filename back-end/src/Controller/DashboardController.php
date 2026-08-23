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

        $transactions = $entityManager
            ->getRepository(Transaction::class)
            ->findBy(
                ['owner' => $user],
                ['transactionDate' => 'DESC']
            );

        $income = 0;
        $expense = 0;

        $data = [];

        foreach ($transactions as $transaction) {
            $amount = (float) $transaction->getAmount();

            if ($transaction->getType() === 'income') {
                $income += $amount;
            }

            if ($transaction->getType() === 'expense') {
                $expense += $amount;
            }

            $data[] = [
                'id' => $transaction->getId(),
                'amount' => $transaction->getAmount(),
                'type' => $transaction->getType(),
                'description' => $transaction->getDescription(),
                'date' => $transaction->getTransactionDate()?->format('Y-m-d'),
            ];
        }

        $balance = $income - $expense;

        return new JsonResponse([
            'balance' => $balance,
            'income' => $income,
            'expense' => $expense,
            'transactions' => $data,
        ]);
    }
}
