<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\WorkDayRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: WorkDayRepository::class)]
#[ORM\Table(name: 'work_days')]
#[UniqueEntity(fields: ['date'], message: 'Un planning existe déjà pour cette date')]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['work_day:read']]),
        new GetCollection(normalizationContext: ['groups' => ['work_day:read']]),
        new Post(denormalizationContext: ['groups' => ['work_day:write']]),
        new Put(denormalizationContext: ['groups' => ['work_day:write']]),
        new Patch(denormalizationContext: ['groups' => ['work_day:write']]),
        new Delete(),
    ],
    order: ['date' => 'ASC'],
)]
class WorkDay
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['work_day:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Assert\NotNull]
    #[Groups(['work_day:read', 'work_day:write'])]
    private \DateTimeImmutable $date;

    #[ORM\ManyToOne(inversedBy: 'workDays')]
    #[Groups(['work_day:read', 'work_day:write'])]
    #[Assert\NotNull]
    private ?WorkShift $workShift = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['work_day:read', 'work_day:write'])]
    private ?string $note = null;

    #[ORM\Column]
    #[Groups(['work_day:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['work_day:read'])]
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

    // Getters et setters
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

    public function getWorkShift(): ?WorkShift
    {
        return $this->workShift;
    }

    public function setWorkShift(?WorkShift $workShift): self
    {
        $this->workShift = $workShift;

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
}
