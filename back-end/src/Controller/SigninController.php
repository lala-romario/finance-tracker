<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SigninController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): Response
    {
        // Cette méthode ne sera jamais exécutée.
        // Symfony Security intercepte /api/login
        // grâce au firewall json_login.

        return new Response();
    }
}