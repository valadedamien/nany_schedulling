<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\ApiPlatform\Dto\Output\DayScheduleOutput;
use App\ApiPlatform\State\DayScheduleProcessor;
use App\Repository\DayScheduleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: DayScheduleRepository::class)]
#[ORM\Table(name: 'day_schedules')]
#[UniqueEntity(fields: ['date'], message: 'Un planning existe déjà pour cette date')]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['day_schedule:read']]),
        new GetCollection(normalizationContext: ['groups' => ['day_schedule:read']]),
        new Post(denormalizationContext: ['groups' => ['day_schedule:write']]),
        new Put(denormalizationContext: ['groups' => ['day_schedule:write']]),
        new Patch(denormalizationContext: ['groups' => ['day_schedule:write']]),
        new Delete(),
    ],
    order: ['date' => 'ASC'],
)]
class DaySchedule
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['day_schedule:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Assert\NotNull]
    #[Groups(['day_schedule:read', 'day_schedule:write'])]
    private \DateTimeImmutable $date;

    #[ORM\ManyToOne(inversedBy: 'daySchedules')]
    #[Groups(['day_schedule:read', 'day_schedule:write'])]
    private ?TimeSlot $timeSlot = null;

    #[ORM\Column(type: 'time', nullable: true)]
    #[Groups(['day_schedule:read', 'day_schedule:write'])]
    private ?\DateTimeInterface $customDropOffTime = null;

    #[ORM\Column(type: 'time', nullable: true)]
    #[Groups(['day_schedule:read', 'day_schedule:write'])]
    private ?\DateTimeInterface $customPickUpTime = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['day_schedule:read', 'day_schedule:write'])]
    private ?string $note = null;

    #[ORM\Column]
    #[Groups(['day_schedule:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['day_schedule:read'])]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getTimeSlot(): ?TimeSlot
    {
        return $this->timeSlot;
    }

    public function setTimeSlot(?TimeSlot $timeSlot): self
    {
        $this->timeSlot = $timeSlot;

        return $this;
    }

    public function getCustomDropOffTime(): ?\DateTimeInterface
    {
        return $this->customDropOffTime;
    }

    public function setCustomDropOffTime(?\DateTimeInterface $customDropOffTime): self
    {
        $this->customDropOffTime = $customDropOffTime;

        return $this;
    }

    public function getCustomPickUpTime(): ?\DateTimeInterface
    {
        return $this->customPickUpTime;
    }

    public function setCustomPickUpTime(?\DateTimeInterface $customPickUpTime): self
    {
        $this->customPickUpTime = $customPickUpTime;

        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): self
    {
        $this->note = $note;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /**
     * Obtient l'heure effective de dépôt (personnalisée ou du créneau)
     */
    #[Groups(['day_schedule:read'])]
    public function getEffectiveDropOffTime(): ?\DateTimeInterface
    {
        return $this->customDropOffTime ?? $this->timeSlot?->getDropOffTime();
    }

    /**
     * Obtient l'heure effective de récupération (personnalisée ou du créneau)
     */
    #[Groups(['day_schedule:read'])]
    public function getEffectivePickUpTime(): ?\DateTimeInterface
    {
        return $this->customPickUpTime ?? $this->timeSlot?->getPickUpTime();
    }
}
