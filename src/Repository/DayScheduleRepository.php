<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\DaySchedule;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DaySchedule>
 *
 * @method DaySchedule|null find($id, $lockMode = null, $lockVersion = null)
 * @method DaySchedule|null findOneBy(array $criteria, array $orderBy = null)
 * @method DaySchedule[]    findAll()
 * @method DaySchedule[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DayScheduleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DaySchedule::class);
    }

    /**
     * Trouve tous les plannings pour un mois spécifique
     *
     * @param int $year Année
     * @param int $month Mois (1-12)
     * @return DaySchedule[]
     */
    public function findByYearAndMonth(int $year, int $month): array
    {
        // Détermination du premier et dernier jour du mois
        $firstDay = new \DateTimeImmutable(sprintf('%d-%02d-01', $year, $month));
        $lastDay = $firstDay->modify('last day of this month');

        return $this->createQueryBuilder('d')
            ->andWhere('d.date >= :start')
            ->andWhere('d.date <= :end')
            ->leftJoin('d.timeSlot', 't')
            ->addSelect('t') // Eager loading pour éviter les requêtes N+1
            ->setParameter('start', $firstDay)
            ->setParameter('end', $lastDay)
            ->orderBy('d.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les plannings entre deux dates
     *
     * @param \DateTimeInterface $startDate
     * @param \DateTimeInterface $endDate
     * @return DaySchedule[]
     */
    public function findBetweenDates(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.date >= :start')
            ->andWhere('d.date <= :end')
            ->leftJoin('d.timeSlot', 't')
            ->addSelect('t') // Eager loading
            ->setParameter('start', $startDate)
            ->setParameter('end', $endDate)
            ->orderBy('d.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Sauvegarde un planning journalier
     */
    public function save(DaySchedule $daySchedule): void
    {
        $this->getEntityManager()->persist($daySchedule);
        $this->getEntityManager()->flush();
    }

    /**
     * Supprime un planning journalier
     */
    public function remove(DaySchedule $daySchedule): void
    {
        $this->getEntityManager()->remove($daySchedule);
        $this->getEntityManager()->flush();
    }
}
