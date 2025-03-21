import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogFeatures1710021000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Añadir nuevos campos a la tabla users
        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "profileImageUrl" VARCHAR,
            ADD COLUMN IF NOT EXISTS "position" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "bio" TEXT
        `);

        // Crear tabla para posts relacionados si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "related_posts" (
                "post_id" UUID NOT NULL,
                "related_post_id" UUID NOT NULL,
                PRIMARY KEY ("post_id", "related_post_id"),
                CONSTRAINT "FK_related_posts_post_id" FOREIGN KEY ("post_id") 
                    REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_related_posts_related_post_id" FOREIGN KEY ("related_post_id") 
                    REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        // Crear índices para mejorar el rendimiento
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_posts_slug" ON "posts" ("slug");
            CREATE INDEX IF NOT EXISTS "IDX_posts_status" ON "posts" ("status");
            CREATE INDEX IF NOT EXISTS "IDX_posts_categoryId" ON "posts" ("categoryId");
            CREATE INDEX IF NOT EXISTS "IDX_posts_authorId" ON "posts" ("authorId");
            CREATE INDEX IF NOT EXISTS "IDX_posts_publishedAt" ON "posts" ("publishedAt");
            CREATE INDEX IF NOT EXISTS "IDX_categories_slug" ON "categories" ("slug");
            CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");
            CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar tabla de posts relacionados
        await queryRunner.query(`DROP TABLE IF EXISTS "related_posts"`);

        // Eliminar campos de la tabla users
        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN IF EXISTS "profileImageUrl",
            DROP COLUMN IF EXISTS "position",
            DROP COLUMN IF EXISTS "bio"
        `);

        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_posts_slug";
            DROP INDEX IF EXISTS "IDX_posts_status";
            DROP INDEX IF EXISTS "IDX_posts_categoryId";
            DROP INDEX IF EXISTS "IDX_posts_authorId";
            DROP INDEX IF EXISTS "IDX_posts_publishedAt";
            DROP INDEX IF EXISTS "IDX_categories_slug";
            DROP INDEX IF EXISTS "IDX_users_email";
            DROP INDEX IF EXISTS "IDX_users_role";
        `);
    }
} 