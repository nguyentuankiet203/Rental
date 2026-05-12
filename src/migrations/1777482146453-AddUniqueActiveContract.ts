import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueActiveContract1777482146453 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_active_contract_per_room
      ON contract(room_id)
      WHERE status = 'ACTIVE';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX unique_active_contract_per_room;
    `);
  }
}
