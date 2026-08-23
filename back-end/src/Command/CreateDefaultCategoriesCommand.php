<?php

namespace App\Command;

use App\Entity\Category;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-default-categories',
    description: 'Create default categories for all users',
)]
class CreateDefaultCategoriesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(
        InputInterface $input,
        OutputInterface $output
    ): int {
        $io = new SymfonyStyle($input, $output);

        $users = $this->entityManager
            ->getRepository(User::class)
            ->findAll();

        if (count($users) === 0) {
            $io->warning('Aucun utilisateur trouvé.');
            return Command::SUCCESS;
        }

        $defaultCategories = [
            [
                'name' => 'Salaire',
                'type' => 'income',
                'icon' => '💼',
            ],
            [
                'name' => 'Autres revenus',
                'type' => 'income',
                'icon' => '💰',
            ],
            [
                'name' => 'Alimentation',
                'type' => 'expense',
                'icon' => '🍔',
            ],
            [
                'name' => 'Transport',
                'type' => 'expense',
                'icon' => '🚗',
            ],
            [
                'name' => 'Logement',
                'type' => 'expense',
                'icon' => '🏠',
            ],
            [
                'name' => 'Santé',
                'type' => 'expense',
                'icon' => '❤️',
            ],
            [
                'name' => 'Loisirs',
                'type' => 'expense',
                'icon' => '🎮',
            ],
            [
                'name' => 'Shopping',
                'type' => 'expense',
                'icon' => '🛍️',
            ],
            [
                'name' => 'Bricolage',
                'type' => 'expense',
                'icon' => '🔨',
            ],
            [
                'name' => 'Matériel maison',
                'type' => 'expense',
                'icon' => '🛠️',
            ],
            [
                'name' => 'Vacances',
                'type' => 'expense',
                'icon' => '🏖️',
            ],
            [
                'name' => 'Abonnements',
                'type' => 'expense',
                'icon' => '📱',
            ],
            [
                'name' => 'Autres dépenses',
                'type' => 'expense',
                'icon' => '📦',
            ],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($users as $user) {
            foreach ($defaultCategories as $defaultCategory) {

                $existingCategory = $this->entityManager
                    ->getRepository(Category::class)
                    ->findOneBy([
                        'name' => $defaultCategory['name'],
                        'type' => $defaultCategory['type'],
                        'owner' => $user,
                    ]);

                if ($existingCategory) {
                    $skipped++;
                    continue;
                }

                $category = new Category();

                $category->setName($defaultCategory['name']);
                $category->setType($defaultCategory['type']);
                $category->setIcon($defaultCategory['icon']);
                $category->setOwner($user);

                $this->entityManager->persist($category);

                $created++;
            }
        }

        $this->entityManager->flush();

        $io->success([
            sprintf('%d catégorie(s) créée(s).', $created),
            sprintf('%d catégorie(s) déjà existante(s) ignorée(s).', $skipped),
        ]);

        return Command::SUCCESS;
    }
}