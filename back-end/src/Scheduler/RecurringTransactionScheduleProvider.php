<?php

namespace App\Scheduler;

use App\Service\RecurringTransactionProcessor;
use Symfony\Component\Scheduler\Attribute\AsScheduleProvider;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Trigger\CronExpressionTrigger;

#[AsScheduleProvider('recurring_transactions')]
final class RecurringTransactionScheduleProvider
{
    public function __construct(
        private RecurringTransactionProcessor $processor,
    ) {
    }

    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(
                RecurringMessage::cron(
                    '0 * * * *',
                    new ProcessRecurringTransactionsMessage()
                )
            );
    }
}
