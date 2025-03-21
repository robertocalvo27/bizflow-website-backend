import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResourcesTable1742528893388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "resources" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "slug" character varying NOT NULL UNIQUE,
                "description" text NOT NULL,
                "fileUrl" character varying NOT NULL,
                "resourceType" character varying NOT NULL DEFAULT 'other',
                "fileSize" integer NOT NULL,
                "thumbnailUrl" character varying,
                "downloadInstructions" text,
                "featured" boolean NOT NULL DEFAULT false,
                "isPublic" boolean NOT NULL DEFAULT true,
                "downloadCount" integer NOT NULL DEFAULT 0,
                "categoryId" uuid NOT NULL,
                "uploaderId" uuid NOT NULL,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_resources_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_resources_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Crear índices para mejorar el rendimiento de las búsquedas
        await queryRunner.query(`
            CREATE INDEX "IDX_resources_slug" ON "resources" ("slug");
            CREATE INDEX "IDX_resources_resourceType" ON "resources" ("resourceType");
            CREATE INDEX "IDX_resources_categoryId" ON "resources" ("categoryId");
            CREATE INDEX "IDX_resources_uploaderId" ON "resources" ("uploaderId");
            CREATE INDEX "IDX_resources_featured" ON "resources" ("featured");
            CREATE INDEX "IDX_resources_isPublic" ON "resources" ("isPublic");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_slug"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_resourceType"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_categoryId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_uploaderId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_featured"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_resources_isPublic"`);

        // Eliminar tabla
        await queryRunner.query(`DROP TABLE IF EXISTS "resources"`);
    }

}
