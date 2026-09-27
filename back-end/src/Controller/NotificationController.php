<?php

namespace App\Controller;

use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
final class NotificationController extends AbstractController
{
    /**
     * Liste les notifications de l'utilisateur connecté.
     */
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $notifications = $entityManager
            ->getRepository(Notification::class)
            ->findBy(
                ['owner' => $user],
                ['createdAt' => 'DESC']
            );

        $data = array_map(
            fn (Notification $notification) => $this->serializeNotification($notification),
            $notifications
        );

        return $this->json($data);
    }

    /**
     * Marque une notification comme lue.
     */
    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function markAsRead(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $notification = $entityManager
            ->getRepository(Notification::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user,
            ]);

        if (!$notification) {
            return $this->json([
                'message' => 'Notification introuvable.'
            ], 404);
        }

        $notification->setRead(true);

        $entityManager->flush();

        return $this->json([
            'message' => 'Notification marquée comme lue.',
            'notification' => $this->serializeNotification($notification),
        ]);
    }

    /**
     * Marque toutes les notifications de l'utilisateur comme lues.
     */
    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['PATCH'])]
    public function markAllAsRead(
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $notifications = $entityManager
            ->getRepository(Notification::class)
            ->findBy([
                'owner' => $user,
                'read' => false,
            ]);

        foreach ($notifications as $notification) {
            $notification->setRead(true);
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Toutes les notifications ont été marquées comme lues.',
            'count' => count($notifications),
        ]);
    }

    /**
     * Supprime une notification.
     */
    #[Route('/{id}', name: 'api_notifications_delete', methods: ['DELETE'])]
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

        $notification = $entityManager
            ->getRepository(Notification::class)
            ->findOneBy([
                'id' => $id,
                'owner' => $user,
            ]);

        if (!$notification) {
            return $this->json([
                'message' => 'Notification introuvable.'
            ], 404);
        }

        $entityManager->remove($notification);
        $entityManager->flush();

        return $this->json([
            'message' => 'Notification supprimée.',
        ]);
    }

    /**
     * Transforme une notification en tableau JSON.
     */
    private function serializeNotification(
        Notification $notification
    ): array {
        return [
            'id' => $notification->getId(),
            'title' => $notification->getTitle(),
            'message' => $notification->getMessage(),
            'type' => $notification->getType(),
            'read' => $notification->isRead(),
            'createdAt' => $notification->getCreatedAt()?->format(
                \DateTimeInterface::ATOM
            ),
        ];
    }
}