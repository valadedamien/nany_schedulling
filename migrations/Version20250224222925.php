<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250224222925 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE day_schedules (id INT GENERATED BY DEFAULT AS IDENTITY NOT NULL, date DATE NOT NULL, custom_drop_off_time TIME(0) WITHOUT TIME ZONE DEFAULT NULL, custom_pick_up_time TIME(0) WITHOUT TIME ZONE DEFAULT NULL, note TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, time_slot_id INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_688BAFBED62B0FA ON day_schedules (time_slot_id)');
        $this->addSql('CREATE TABLE time_slots (id INT GENERATED BY DEFAULT AS IDENTITY NOT NULL, name VARCHAR(255) NOT NULL, drop_off_time TIME(0) WITHOUT TIME ZONE NOT NULL, pick_up_time TIME(0) WITHOUT TIME ZONE NOT NULL, color VARCHAR(7) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('ALTER TABLE day_schedules ADD CONSTRAINT FK_688BAFBED62B0FA FOREIGN KEY (time_slot_id) REFERENCES time_slots (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE day_schedules DROP CONSTRAINT FK_688BAFBED62B0FA');
        $this->addSql('DROP TABLE day_schedules');
        $this->addSql('DROP TABLE time_slots');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
