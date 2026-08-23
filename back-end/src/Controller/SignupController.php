<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class SignupController
{
    #[Route('/api/signup', name: 'api_signup', methods: ['POST'])]
    public function signup(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {

        // Récupérer le JSON envoyé par le client
        $data = json_decode($request->getContent(), true);

        // Vérifier que le JSON est valide
        if (!is_array($data)) {
            return new JsonResponse([
                'message' => 'Invalid JSON data'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Récupérer les données
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $firstName = trim($data['firstName'] ?? '');
        $lastName = trim($data['lastName'] ?? '');

        // Vérifier les champs obligatoires
        if (
            $email === '' ||
            $password === '' ||
            $firstName === '' ||
            $lastName === ''
        ) {
            return new JsonResponse([
                'message' => 'All fields are required'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier le format de l'email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse([
                'message' => 'Invalid email address'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier la longueur du mot de passe
        if (strlen($password) < 8) {
            return new JsonResponse([
                'message' => 'Password must contain at least 8 characters'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'email existe déjà
        $existingUser = $entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);

        if ($existingUser !== null) {
            return new JsonResponse([
                'message' => 'Email is already in use'
            ], JsonResponse::HTTP_CONFLICT);
        }

        // Créer le nouvel utilisateur
        $user = new User();

        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);

        // Hasher le mot de passe
        $hashedPassword = $passwordHasher->hashPassword(
            $user,
            $password
        );

        $user->setPassword($hashedPassword);

        // Sauvegarder le nouvel utilisateur
        $entityManager->persist($user);

        /*
         * ---------------------------------------------------------
         * Créer les catégories par défaut de l'utilisateur
         * ---------------------------------------------------------
         */

        $defaultCategories = [
            // Revenus
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

            // Dépenses
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

        foreach ($defaultCategories as $categoryData) {

            $category = new Category();

            $category->setName($categoryData['name']);
            $category->setType($categoryData['type']);
            $category->setIcon($categoryData['icon']);
            $category->setOwner($user);

            $entityManager->persist($category);
        }

        // Sauvegarder User + Categories
        $entityManager->flush();

        // Réponse
        return new JsonResponse([
            'message' => 'User created successfully',

            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ]
        ], JsonResponse::HTTP_CREATED);
    }
}
