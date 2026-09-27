<?php

namespace App\Repository;

use App\Entity\Transaction;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Transaction>
 */
class TransactionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Transaction::class);
    }

    /**
     * Retourne le solde du mois actuel pour un utilisateur.
     *
     * Solde = revenus du mois - dépenses du mois.
     */
    public function getCurrentMonthBalance(
        User $user,
        \DateTimeImmutable $now
    ): float {
        $startOfMonth = $now
            ->modify('first day of this month')
            ->setTime(0, 0, 0);

        $startOfNextMonth = $startOfMonth
            ->modify('+1 month');

        $transactions = $this->createQueryBuilder('t')
            ->andWhere('t.owner = :user')
            ->andWhere('t.transactionDate >= :start')
            ->andWhere('t.transactionDate < :end')
            ->setParameter('user', $user)
            ->setParameter('start', $startOfMonth)
            ->setParameter('end', $startOfNextMonth)
            ->getQuery()
            ->getResult();

        $balance = 0.0;

        foreach ($transactions as $transaction) {
            $amount = (float) $transaction->getAmount();

            if ($transaction->getType() === 'income') {
                $balance += $amount;
            } elseif ($transaction->getType() === 'expense') {
                $balance -= $amount;
            }
        }

        return $balance;
    }
}