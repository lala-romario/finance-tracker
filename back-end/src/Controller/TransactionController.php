<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Transaction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class TransactionController extends AbstractController
{
    #[Route('/api/transactions', name: 'api_transactions_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse([
                'error' => 'Invalid JSON data.'
            ], 400);
        }

        if (
            !isset($data['amount']) ||
            !isset($data['type']) ||
            !isset($data['category'])
        ) {
            return new JsonResponse([
                'error' => 'amount, type and category are required.'
            ], 400);
        }

        if (!in_array($data['type'], ['income', 'expense'], true)) {
            return new JsonResponse([
                'error' => 'Type must be income or expense.'
            ], 400);
        }

        if (!is_numeric($data['amount']) || (float) $data['amount'] <= 0) {
            return new JsonResponse([
                'error' => 'Amount must be a positive number.'
            ], 400);
        }

        $category = $entityManager
            ->getRepository(Category::class)
            ->findOneBy([
                'name' => $data['category'],
                'owner' => $user,
            ]);

        if (!$category) {
            return new JsonResponse([
                'error' => 'Category not found.'
            ], 404);
        }

        $transaction = new Transaction();

        $transaction->setAmount((string) $data['amount']);
        $transaction->setType($data['type']);
        $transaction->setDescription($data['description'] ?? null);
        $transaction->setTransactionDate(new \DateTimeImmutable());
        $transaction->setOwner($user);
        $transaction->setCategory($category);

        $entityManager->persist($transaction);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Transaction created successfully.',
            'transaction' => [
                'id' => $transaction->getId(),
                'amount' => $transaction->getAmount(),
                'type' => $transaction->getType(),
                'description' => $transaction->getDescription(),
                'date' => $transaction->getTransactionDate()?->format('Y-m-d'),
                'category' => $category->getName(),
            ],
        ], 201);
    }
}