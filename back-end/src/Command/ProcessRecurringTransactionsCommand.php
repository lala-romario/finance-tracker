<?php

namespace App\Command;

use App\Service\RecurringTransactionProcessor;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Scheduler\Attribute\AsCronTask;

#[AsCronTask(
    '0 * * * *',
    timezone: 'Africa/Nairobi'
)]

#[AsCommand(
    name: 'app:process-recurring-transactions',
    description: 'Process due and pending recurring transactions',
)]
class ProcessRecurringTransactionsCommand extends Command
{
    public function __construct(
        private RecurringTransactionProcessor $processor,
    ) {
        parent::__construct();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $io = new SymfonyStyle($input, $output);

        try {
            $processed = $this->processor->process();

            $io->success(
                sprintf(
                    '%d transaction(s) récurrente(s) exécutée(s).',
                    $processed
                )
            );

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $io->error(
                'Erreur lors du traitement des transactions récurrentes : '
                    . $e->getMessage()
            );

            return Command::FAILURE;
        }
    }
}
