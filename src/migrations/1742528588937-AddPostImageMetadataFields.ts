import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostImageMetadataFields1742528588937 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir campos para las imágenes
        await queryRunner.query(`
            ALTER TABLE "posts" 
            ADD COLUMN IF NOT EXISTS "featured_image_alt" character varying(200),
            ADD COLUMN IF NOT EXISTS "featured_image_caption" character varying(200),
            ADD COLUMN IF NOT EXISTS "social_image_alt" character varying(200),
            ADD COLUMN IF NOT EXISTS "reading_time" integer,
            ADD COLUMN IF NOT EXISTS "custom_metadata" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar campos añadidos
        await queryRunner.query(`
            ALTER TABLE "posts" 
            DROP COLUMN IF EXISTS "featured_image_alt",
            DROP COLUMN IF EXISTS "featured_image_caption",
            DROP COLUMN IF EXISTS "social_image_alt",
            DROP COLUMN IF EXISTS "reading_time",
            DROP COLUMN IF EXISTS "custom_metadata"
        `);
    }

}
