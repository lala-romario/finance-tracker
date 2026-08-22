<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class SigninController
{
    #[Route('/api/signin', name: 'api_signin', methods: ['POST'])]
    public function signin(
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

        // Vérifier les champs obligatoires
        if ($email === '' || $password === '') {
            return new JsonResponse([
                'message' => 'Email and password are required'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Rechercher l'utilisateur par email
        $user = $entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);

        // Vérifier que l'utilisateur existe
        if ($user === null) {
            return new JsonResponse([
                'message' => 'Invalid credentials'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse([
                'message' => 'Invalid credentials'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Connexion réussie
        return new JsonResponse([
            'message' => 'Signin successful',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ]
        ], JsonResponse::HTTP_OK);
    }
}