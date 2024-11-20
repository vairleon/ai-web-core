import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserCreditAndExtraInfo1710000000000 implements MigrationInterface {
    name = 'AddUserCreditAndExtraInfo1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`credit\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`extraInfo\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`extraInfo\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`credit\``);
    }
}
