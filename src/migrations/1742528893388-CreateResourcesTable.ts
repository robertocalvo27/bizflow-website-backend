import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResourcesTable1742528893388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // La tabla resources ya existe, por lo que no hacemos nada.
        // Esta migración se mantendrá para propósitos de registro
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No hacemos nada en el down ya que la tabla resources se manejará en otra migración
    }

}
