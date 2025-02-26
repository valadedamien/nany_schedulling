<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\WorkShiftRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WorkShiftRepository::class)]
#[ORM\Table(name: 'work_shifts')]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['work_shift:read']]),
        new GetCollection(normalizationContext: ['groups' => ['work_shift:read']]),
        new Post(denormalizationContext: ['groups' => ['work_shift:write']]),
        new Put(denormalizationContext: ['groups' => ['work_shift:write']]),
        new Patch(denormalizationContext: ['groups' => ['work_shift:write']]),
        new Delete(),
    ],
    order: ['name' => 'ASC'],
    paginationEnabled: false,
)]
class WorkShift
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['work_shift:read', 'work_day:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 255)]
    #[Groups(['work_shift:read', 'work_shift:write', 'work_day:read'])]
    private string $name;

    #[ORM\Column(length: 7)]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(['work_shift:read', 'work_shift:write', 'work_day:read'])]
    private string $color = '#3B82F6'; // Default blue color

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['work_shift:read', 'work_shift:write', 'work_day:read'])]
    private ?string $icon = null;

    #[ORM\OneToMany(targetEntity: WorkDay::class, mappedBy: 'workShift')]
    private Collection $workDays;

    public function __construct()
    {
        $this->workDays = new ArrayCollection();
    }

    // Getters et setters...
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(string $color): self
    {
        $this->color = $color;

        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    /**
     * @return Collection<int, WorkDay>
     */
    public function getWorkDays(): Collection
    {
        return $this->workDays;
    }

    public function addWorkDay(WorkDay $workDay): self
    {
        if (!$this->workDays->contains($workDay)) {
            $this->workDays->add($workDay);
            $workDay->setWorkShift($this);
        }

        return $this;
    }

    public function removeWorkDay(WorkDay $workDay): self
    {
        if ($this->workDays->removeElement($workDay)) {
            // set the owning side to null (unless already changed)
            if ($workDay->getWorkShift() === $this) {
                $workDay->setWorkShift(null);
            }
        }

        return $this;
    }
}
