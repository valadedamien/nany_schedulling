<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AppController extends AbstractController
{
    #[Route('/', name: 'app_index')]
    public function index(): Response
    {
        return $this->render('app/index.html.twig');
    }

    #[Route('/{path}', name: 'app_catchall', requirements: ['path' => '^(?!api).*$'])]
    public function catchAll(): Response
    {
        // Cette route permet de gérer les SPA routes et de toujours renvoyer vers l'index
        return $this->render('app/index.html.twig');
    }
}
