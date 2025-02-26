<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\WorkShift;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WorkShift>
 *
 * @method WorkShift|null find($id, $lockMode = null, $lockVersion = null)
 * @method WorkShift|null findOneBy(array $criteria, array $orderBy = null)
 * @method WorkShift[]    findAll()
 * @method WorkShift[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WorkShiftRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorkShift::class);
    }
}
