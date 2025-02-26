<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\TimeSlot;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TimeSlot>
 *
 * @method TimeSlot|null find($id, $lockMode = null, $lockVersion = null)
 * @method TimeSlot|null findOneBy(array $criteria, array $orderBy = null)
 * @method TimeSlot[]    findAll()
 * @method TimeSlot[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TimeSlotRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TimeSlot::class);
    }

    /**
     * @return TimeSlot[] Retourne tous les créneaux horaires triés par nom
     */
    public function findAllSorted(): array
    {
        return $this->createQueryBuilder('t')
            ->orderBy('t.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Sauvegarde un créneau horaire
     */
    public function save(TimeSlot $timeSlot): void
    {
        $this->getEntityManager()->persist($timeSlot);
        $this->getEntityManager()->flush();
    }

    /**
     * Supprime un créneau horaire
     */
    public function remove(TimeSlot $timeSlot): void
    {
        $this->getEntityManager()->remove($timeSlot);
        $this->getEntityManager()->flush();
    }
}
