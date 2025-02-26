<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\TimeSlotRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TimeSlotRepository::class)]
#[ORM\Table(name: 'time_slots')]
#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['time_slot:read']]),
        new GetCollection(normalizationContext: ['groups' => ['time_slot:read']]),
        new Post(denormalizationContext: ['groups' => ['time_slot:write']]),
        new Put(denormalizationContext: ['groups' => ['time_slot:write']]),
        new Delete(),
    ],
    order: ['name' => 'ASC'],
    paginationEnabled: false,
)]
class TimeSlot
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['time_slot:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 255)]
    #[Groups(['time_slot:read', 'time_slot:write', 'day_schedule:read'])]
    private string $name;

    #[ORM\Column(type: 'time')]
    #[Assert\NotNull]
    #[Groups(['time_slot:read', 'time_slot:write', 'day_schedule:read'])]
    private \DateTimeInterface $dropOffTime;

    #[ORM\Column(type: 'time')]
    #[Assert\NotNull]
    #[Groups(['time_slot:read', 'time_slot:write', 'day_schedule:read'])]
    private \DateTimeInterface $pickUpTime;

    #[ORM\Column(length: 7)]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(['time_slot:read', 'time_slot:write', 'day_schedule:read'])]
    private string $color = '#3B82F6'; // Default blue color

    #[ORM\OneToMany(targetEntity: DaySchedule::class, mappedBy: 'timeSlot')]
    private Collection $daySchedules;

    public function __construct()
    {
        $this->daySchedules = new ArrayCollection();
    }

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

    public function getDropOffTime(): \DateTimeInterface
    {
        return $this->dropOffTime;
    }

    public function setDropOffTime(\DateTimeInterface $dropOffTime): self
    {
        $this->dropOffTime = $dropOffTime;

        return $this;
    }

    public function getPickUpTime(): \DateTimeInterface
    {
        return $this->pickUpTime;
    }

    public function setPickUpTime(\DateTimeInterface $pickUpTime): self
    {
        $this->pickUpTime = $pickUpTime;

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

    /**
     * @return Collection<int, DaySchedule>
     */
    public function getDaySchedules(): Collection
    {
        return $this->daySchedules;
    }

    public function addDaySchedule(DaySchedule $daySchedule): self
    {
        if (!$this->daySchedules->contains($daySchedule)) {
            $this->daySchedules->add($daySchedule);
            $daySchedule->setTimeSlot($this);
        }

        return $this;
    }

    public function removeDaySchedule(DaySchedule $daySchedule): self
    {
        if ($this->daySchedules->removeElement($daySchedule)) {
            // set the owning side to null (unless already changed)
            if ($daySchedule->getTimeSlot() === $this) {
                $daySchedule->setTimeSlot(null);
            }
        }

        return $this;
    }
}
