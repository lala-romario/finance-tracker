<?php

namespace App\Repository;

use App\Entity\RecurringTransaction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RecurringTransactionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RecurringTransaction::class);
    }

    /**
     * Retourne les transactions récurrentes actives
     * dont la date d'échéance est arrivée.
     *
     * @return RecurringTransaction[]
     */
    public function findDueTransactions(\DateTimeImmutable $today): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.active = :active')
            ->andWhere('r.nextDueDate <= :today')
            ->setParameter('active', true)
            ->setParameter('today', $today)
            ->orderBy('r.nextDueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Retourne les transactions récurrentes en attente.
     *
     * @return RecurringTransaction[]
     */
    public function findPendingTransactions(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.active = :active')
            ->andWhere('r.pending = :pending')
            ->setParameter('active', true)
            ->setParameter('pending', true)
            ->orderBy('r.nextDueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
