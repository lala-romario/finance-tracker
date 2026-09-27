<?php

namespace App\Controller;

use App\Entity\Goal;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/goals')]
final class GoalController extends AbstractController
{
    /**
     * GET /api/goals
     * Récupère uniquement les objectifs de l'utilisateur connecté.
     */
    #[Route('', name: 'api_goals_list', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $goals = $entityManager
            ->getRepository(Goal::class)
            ->findBy(
                ['owner' => $user],
                ['createdAt' => 'DESC']
            );

        $data = array_map(function (Goal $goal) {
            return [
                'id' => $goal->getId(),
                'title' => $goal->getTitle(),
                'targetAmount' => (float) $goal->getTargetAmount(),
                'currentAmount' => (float) $goal->getCurrentAmount(),
                'category' => $goal->getCategory(),
                'deadline' => $goal->getDeadline()?->format('Y-m-d'),
                'createdAt' => $goal->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $goal->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ];
        }, $goals);

        return $this->json($data);
    }

    /**
     * POST /api/goals
     * Crée un nouvel objectif pour l'utilisateur connecté.
     */
    #[Route('', name: 'api_goals_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'message' => 'Données JSON invalides'
            ], 400);
        }

        if (
            empty($data['title']) ||
            !isset($data['targetAmount']) ||
            empty($data['category'])
        ) {
            return $this->json([
                'message' => 'title, targetAmount et category sont obligatoires'
            ], 400);
        }

        if (!is_numeric($data['targetAmount']) || (float) $data['targetAmount'] <= 0) {
            return $this->json([
                'message' => 'targetAmount doit être un nombre supérieur à 0'
            ], 400);
        }

        $goal = new Goal();

        $goal->setTitle(trim($data['title']));
        $goal->setTargetAmount((string) $data['targetAmount']);
        $goal->setCurrentAmount(
            isset($data['currentAmount'])
                ? (string) $data['currentAmount']
                : '0'
        );
        $goal->setCategory(trim($data['category']));
        $goal->setOwner($user);

        if (!empty($data['deadline'])) {
            try {
                $goal->setDeadline(
                    new \DateTimeImmutable($data['deadline'])
                );
            } catch (\Exception $e) {
                return $this->json([
                    'message' => 'Format de deadline invalide'
                ], 400);
            }
        }

        $entityManager->persist($goal);
        $entityManager->flush();

        return $this->json([
            'id' => $goal->getId(),
            'title' => $goal->getTitle(),
            'targetAmount' => (float) $goal->getTargetAmount(),
            'currentAmount' => (float) $goal->getCurrentAmount(),
            'category' => $goal->getCategory(),
            'deadline' => $goal->getDeadline()?->format('Y-m-d'),
            'createdAt' => $goal->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $goal->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ], 201);
    }

    /**
     * PATCH /api/goals/{id}/deposit
     * Ajoute un montant à un objectif.
     */
    #[Route('/{id}/deposit', name: 'api_goals_deposit', methods: ['PATCH'])]
    public function deposit(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $goal = $entityManager
            ->getRepository(Goal::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user,
            ]);

        if (!$goal) {
            return $this->json([
                'message' => 'Objectif introuvable'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['amount'])) {
            return $this->json([
                'message' => 'amount est obligatoire'
            ], 400);
        }

        if (!is_numeric($data['amount']) || (float) $data['amount'] <= 0) {
            return $this->json([
                'message' => 'amount doit être un nombre supérieur à 0'
            ], 400);
        }

        $newAmount =
            (float) $goal->getCurrentAmount()
            + (float) $data['amount'];

        $goal->setCurrentAmount((string) $newAmount);

        $entityManager->flush();

        return $this->json([
            'id' => $goal->getId(),
            'title' => $goal->getTitle(),
            'targetAmount' => (float) $goal->getTargetAmount(),
            'currentAmount' => (float) $goal->getCurrentAmount(),
            'category' => $goal->getCategory(),
            'deadline' => $goal->getDeadline()?->format('Y-m-d'),
            'createdAt' => $goal->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $goal->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * DELETE /api/goals/{id}
     * Supprime un objectif appartenant à l'utilisateur connecté.
     */
    #[Route('/{id}', name: 'api_goals_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $goal = $entityManager
            ->getRepository(Goal::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user,
            ]);

        if (!$goal) {
            return $this->json([
                'message' => 'Objectif introuvable'
            ], 404);
        }

        $entityManager->remove($goal);
        $entityManager->flush();

        return $this->json([
            'message' => 'Objectif supprimé'
        ]);
    }
}
