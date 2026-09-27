<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function create(
        User $user,
        string $title,
        string $message,
        string $type
    ): Notification {
        $notification = new Notification();

        $notification
            ->setOwner($user)
            ->setTitle($title)
            ->setMessage($message)
            ->setType($type)
            ->setRead(false)
            ->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($notification);

        return $notification;
    }
}
