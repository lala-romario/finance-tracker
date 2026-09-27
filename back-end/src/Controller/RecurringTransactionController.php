<?php

namespace App\Controller;

use App\Entity\RecurringTransaction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/recurring-transactions')]
final class RecurringTransactionController extends AbstractController
{
    #[Route('', name: 'api_recurring_transactions_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $recurringTransactions = $entityManager
            ->getRepository(RecurringTransaction::class)
            ->findBy(
                ['owner' => $user],
                ['nextDueDate' => 'ASC']
            );

        $data = array_map(
            fn (RecurringTransaction $recurring) => $this->serializeRecurringTransaction($recurring),
            $recurringTransactions
        );

        return $this->json($data);
    }

    #[Route('', name: 'api_recurring_transactions_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'message' => 'JSON invalide.'
            ], 400);
        }

        $requiredFields = [
            'title',
            'amount',
            'type',
            'category',
            'frequency',
            'nextDueDate'
        ];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                return $this->json([
                    'message' => "Le champ '$field' est obligatoire."
                ], 400);
            }
        }

        if (!in_array($data['type'], ['income', 'expense'], true)) {
            return $this->json([
                'message' => 'Type invalide. Utilisez income ou expense.'
            ], 400);
        }

        if (!in_array($data['frequency'], ['weekly', 'monthly', 'yearly'], true)) {
            return $this->json([
                'message' => 'Fréquence invalide.'
            ], 400);
        }

        if (!is_numeric($data['amount']) || (float) $data['amount'] <= 0) {
            return $this->json([
                'message' => 'Le montant doit être supérieur à 0.'
            ], 400);
        }

        try {
            $nextDueDate = new \DateTimeImmutable($data['nextDueDate']);
        } catch (\Exception) {
            return $this->json([
                'message' => 'Date d échéance invalide.'
            ], 400);
        }

        $recurring = new RecurringTransaction();

        $recurring
            ->setTitle(trim($data['title']))
            ->setAmount((string) $data['amount'])
            ->setType($data['type'])
            ->setCategory($data['category'])
            ->setFrequency($data['frequency'])
            ->setNextDueDate($nextDueDate)
            ->setActive(isset($data['active']) ? (bool) $data['active'] : true)
            ->setOwner($user);

        $entityManager->persist($recurring);
        $entityManager->flush();

        return $this->json([
            'message' => 'Transaction récurrente créée avec succès.',
            'recurring' => $this->serializeRecurringTransaction($recurring)
        ], 201);
    }

    #[Route('/{id}', name: 'api_recurring_transactions_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $recurring = $entityManager
            ->getRepository(RecurringTransaction::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user
            ]);

        if (!$recurring) {
            return $this->json([
                'message' => 'Transaction récurrente introuvable.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'message' => 'JSON invalide.'
            ], 400);
        }

        if (isset($data['title'])) {
            $recurring->setTitle(trim($data['title']));
        }

        if (isset($data['amount'])) {
            if (!is_numeric($data['amount']) || (float) $data['amount'] <= 0) {
                return $this->json([
                    'message' => 'Le montant doit être supérieur à 0.'
                ], 400);
            }

            $recurring->setAmount((string) $data['amount']);
        }

        if (isset($data['type'])) {
            if (!in_array($data['type'], ['income', 'expense'], true)) {
                return $this->json([
                    'message' => 'Type invalide.'
                ], 400);
            }

            $recurring->setType($data['type']);
        }

        if (isset($data['category'])) {
            $recurring->setCategory($data['category']);
        }

        if (isset($data['frequency'])) {
            if (!in_array($data['frequency'], ['weekly', 'monthly', 'yearly'], true)) {
                return $this->json([
                    'message' => 'Fréquence invalide.'
                ], 400);
            }

            $recurring->setFrequency($data['frequency']);
        }

        if (isset($data['nextDueDate'])) {
            try {
                $nextDueDate = new \DateTimeImmutable($data['nextDueDate']);
            } catch (\Exception) {
                return $this->json([
                    'message' => 'Date d échéance invalide.'
                ], 400);
            }

            $recurring->setNextDueDate($nextDueDate);
        }

        if (isset($data['active'])) {
            $recurring->setActive((bool) $data['active']);
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Transaction récurrente modifiée avec succès.',
            'recurring' => $this->serializeRecurringTransaction($recurring)
        ]);
    }

    #[Route('/{id}', name: 'api_recurring_transactions_toggle', methods: ['PATCH'])]
    public function toggle(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $recurring = $entityManager
            ->getRepository(RecurringTransaction::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user
            ]);

        if (!$recurring) {
            return $this->json([
                'message' => 'Transaction récurrente introuvable.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['active'])) {
            $recurring->setActive((bool) $data['active']);
        } else {
            $recurring->setActive(!$recurring->isActive());
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Statut modifié avec succès.',
            'recurring' => $this->serializeRecurringTransaction($recurring)
        ]);
    }

    #[Route('/{id}', name: 'api_recurring_transactions_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $recurring = $entityManager
            ->getRepository(RecurringTransaction::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user
            ]);

        if (!$recurring) {
            return $this->json([
                'message' => 'Transaction récurrente introuvable.'
            ], 404);
        }

        $entityManager->remove($recurring);
        $entityManager->flush();

        return $this->json([
            'message' => 'Transaction récurrente supprimée avec succès.'
        ]);
    }

    private function serializeRecurringTransaction(
        RecurringTransaction $recurring
    ): array {
        return [
            'id' => $recurring->getId(),
            'title' => $recurring->getTitle(),
            'amount' => $recurring->getAmount(),
            'type' => $recurring->getType(),
            'category' => $recurring->getCategory(),
            'frequency' => $recurring->getFrequency(),
            'nextDueDate' => $recurring->getNextDueDate()?->format('Y-m-d'),
            'active' => $recurring->isActive(),
            'pending' => $recurring->isPending(),
            'createdAt' => $recurring->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'updatedAt' => $recurring->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}