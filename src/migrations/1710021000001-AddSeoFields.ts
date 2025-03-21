import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeoFields1710021000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir campos SEO a la tabla posts
        await queryRunner.query(`
            ALTER TABLE "posts" 
            ADD COLUMN IF NOT EXISTS "meta_title" varchar(160),
            ADD COLUMN IF NOT EXISTS "meta_description" text,
            ADD COLUMN IF NOT EXISTS "meta_keywords" text,
            ADD COLUMN IF NOT EXISTS "indexable" boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS "canonical_url" varchar(255),
            ADD COLUMN IF NOT EXISTS "structured_data" jsonb,
            ADD COLUMN IF NOT EXISTS "social_image_url" varchar(255)
        `);

        // Añadir campos SEO a la tabla categories
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD COLUMN IF NOT EXISTS "meta_title" varchar(160),
            ADD COLUMN IF NOT EXISTS "meta_description" text,
            ADD COLUMN IF NOT EXISTS "meta_keywords" text,
            ADD COLUMN IF NOT EXISTS "indexable" boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS "canonical_url" varchar(255),
            ADD COLUMN IF NOT EXISTS "social_image_url" varchar(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar campos SEO de la tabla posts
        await queryRunner.query(`
            ALTER TABLE "posts" 
            DROP COLUMN IF EXISTS "meta_title",
            DROP COLUMN IF EXISTS "meta_description",
            DROP COLUMN IF EXISTS "meta_keywords",
            DROP COLUMN IF EXISTS "indexable",
            DROP COLUMN IF EXISTS "canonical_url",
            DROP COLUMN IF EXISTS "structured_data",
            DROP COLUMN IF EXISTS "social_image_url"
        `);

        // Eliminar campos SEO de la tabla categories
        await queryRunner.query(`
            ALTER TABLE "categories" 
            DROP COLUMN IF EXISTS "meta_title",
            DROP COLUMN IF EXISTS "meta_description",
            DROP COLUMN IF EXISTS "meta_keywords",
            DROP COLUMN IF EXISTS "indexable",
            DROP COLUMN IF EXISTS "canonical_url",
            DROP COLUMN IF EXISTS "social_image_url"
        `);
    }
} 