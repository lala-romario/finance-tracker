<?php

namespace App\Service;

use App\Entity\Category;
use App\Entity\RecurringTransaction;
use App\Entity\Transaction;
use App\Repository\RecurringTransactionRepository;
use App\Repository\TransactionRepository;
use Doctrine\ORM\EntityManagerInterface;

class RecurringTransactionProcessor
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RecurringTransactionRepository $recurringTransactionRepository,
        private TransactionRepository $transactionRepository,
        private NotificationService $notificationService,
    ) {}

    /**
     * Traite les transactions récurrentes arrivées à échéance
     * ainsi que celles qui sont en attente.
     */
    public function process(): int
    {
        $today = new \DateTimeImmutable('now', new \DateTimeZone('Africa/Nairobi'));
        $today = $today->setTime(0, 0, 0);

        $dueTransactions = $this->recurringTransactionRepository
            ->findDueTransactions($today);

        $pendingTransactions = $this->recurringTransactionRepository
            ->findPendingTransactions();

        /*
         * Éviter de traiter deux fois la même récurrence
         * si elle apparaît dans les deux résultats.
         */
        $recurringTransactions = [];

        foreach ($dueTransactions as $recurring) {
            $recurringTransactions[$recurring->getId()] = $recurring;
        }

        foreach ($pendingTransactions as $recurring) {
            $recurringTransactions[$recurring->getId()] = $recurring;
        }

        $processed = 0;

        foreach ($recurringTransactions as $recurring) {
            if ($this->processRecurringTransaction($recurring, $today)) {
                $processed++;
            }
        }

        $this->entityManager->flush();

        return $processed;
    }

    private function processRecurringTransaction(
        RecurringTransaction $recurring,
        \DateTimeImmutable $today
    ): bool {
        $owner = $recurring->getOwner();

        if (!$owner) {
            return false;
        }

        $dueDate = $recurring->getNextDueDate();

        if (!$dueDate) {
            return false;
        }

        /*
         * Une transaction non-pending ne doit être exécutée
         * que le jour exact prévu.
         *
         * Cela évite tout rattrapage automatique.
         */
        if (
            !$recurring->isPending()
            && $dueDate->format('Y-m-d') !== $today->format('Y-m-d')
        ) {
            return false;
        }

        /*
         * Trouver la catégorie.
         */
        $category = $this->entityManager
            ->getRepository(Category::class)
            ->findOneBy([
                'name' => $recurring->getCategory(),
                'owner' => $owner,
            ]);

        if (!$category) {
            return false;
        }

        /*
         * ---------------------------------------------------------
         * EXPENSE
         * ---------------------------------------------------------
         */
        if ($recurring->getType() === 'expense') {

            $balance = $this->transactionRepository
                ->getCurrentMonthBalance($owner, $today);

            $amount = (float) $recurring->getAmount();

            /*
             * Pas assez d'argent.
             */
            if ($balance < $amount) {

                /*
                 * On envoie la notification uniquement au moment
                 * où la transaction passe en attente.
                 */
                if (!$recurring->isPending()) {

                    $recurring->setPending(true);

                    $this->notificationService->create(
                        $owner,
                        'Transaction récurrente en attente',
                        sprintf(
                            'Solde insuffisant pour la transaction récurrente « %s » de %s Ar.',
                            $recurring->getTitle(),
                            $this->formatAmount($recurring->getAmount())
                        ),
                        'recurring_insufficient_balance'
                    );
                }

                return false;
            }
        }

        /*
         * ---------------------------------------------------------
         * EXÉCUTER LA TRANSACTION
         * ---------------------------------------------------------
         */

        $transactionDate = $today;

        $transaction = new Transaction();

        $transaction
            ->setAmount($recurring->getAmount())
            ->setType($recurring->getType())
            ->setDescription(
                'Transaction récurrente : ' . $recurring->getTitle()
            )
            ->setTransactionDate($transactionDate)
            ->setOwner($owner)
            ->setCategory($category);

        $this->entityManager->persist($transaction);

        /*
         * La date enregistrée ici est la date d'échéance originale.
         *
         * Exemple :
         * 04/10 → manque d'argent → pending
         * 07/10 → argent disponible → exécution
         * prochaine échéance = 04/11
         */
        $recurring->setLastProcessedDate($dueDate);
        $recurring->setPending(false);

        $nextDueDate = $this->calculateNextDueDate(
            $dueDate,
            $recurring->getFrequency()
        );

        $recurring->setNextDueDate($nextDueDate);

        /*
         * Notification de succès.
         */
        $this->notificationService->create(
            $owner,
            'Transaction récurrente exécutée',
            sprintf(
                'Transaction récurrente « %s » de %s Ar exécutée avec succès.',
                $recurring->getTitle(),
                $this->formatAmount($recurring->getAmount())
            ),
            'recurring_executed'
        );

        return true;
    }

    private function calculateNextDueDate(
        \DateTimeImmutable $currentDate,
        string $frequency
    ): \DateTimeImmutable {
        return match ($frequency) {
            'weekly' => $currentDate->modify('+7 days'),
            'monthly' => $currentDate->modify('+1 month'),
            'yearly' => $currentDate->modify('+1 year'),
            default => throw new \InvalidArgumentException(
                'Fréquence inconnue : ' . $frequency
            ),
        };
    }

    private function formatAmount(string $amount): string
    {
        return number_format(
            (float) $amount,
            0,
            ',',
            ' '
        );
    }
}
