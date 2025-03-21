import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTagsTable1742600000000 implements MigrationInterface {
    name = 'CreateTagsTable1742600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear la tabla de tags
        await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "slug" character varying NOT NULL,
                "description" text,
                "is_active" boolean DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_tags_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_tags" PRIMARY KEY ("id")
            )
        `);

        // Crear la tabla de relación post_tags
        await queryRunner.query(`
            CREATE TABLE "post_tags" (
                "post_id" uuid NOT NULL,
                "tag_id" uuid NOT NULL,
                CONSTRAINT "PK_post_tags" PRIMARY KEY ("post_id", "tag_id")
            )
        `);

        // Crear la tabla de relación video_tags
        await queryRunner.query(`
            CREATE TABLE "video_tags" (
                "video_id" uuid NOT NULL,
                "tag_id" uuid NOT NULL,
                CONSTRAINT "PK_video_tags" PRIMARY KEY ("video_id", "tag_id")
            )
        `);

        // Agregar foreign keys para post_tags
        await queryRunner.query(`
            ALTER TABLE "post_tags" ADD CONSTRAINT "FK_post_tags_post_id" 
            FOREIGN KEY ("post_id") REFERENCES "posts"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "post_tags" ADD CONSTRAINT "FK_post_tags_tag_id" 
            FOREIGN KEY ("tag_id") REFERENCES "tags"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Agregar foreign keys para video_tags
        await queryRunner.query(`
            ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_video_id" 
            FOREIGN KEY ("video_id") REFERENCES "videos"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "video_tags" ADD CONSTRAINT "FK_video_tags_tag_id" 
            FOREIGN KEY ("tag_id") REFERENCES "tags"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`ALTER TABLE "video_tags" DROP CONSTRAINT "FK_video_tags_tag_id"`);
        await queryRunner.query(`ALTER TABLE "video_tags" DROP CONSTRAINT "FK_video_tags_video_id"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_tag_id"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_post_id"`);
        
        // Eliminar tablas
        await queryRunner.query(`DROP TABLE "video_tags"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }
} 