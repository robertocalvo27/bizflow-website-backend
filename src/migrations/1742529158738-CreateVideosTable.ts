import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVideosTable1742529158738 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // La tabla videos ya existe, por lo que no hacemos nada.
        // Esta migración se mantendrá para propósitos de registro

        // Verificar si existe la tabla video_posts, si no existe, la creamos
        const tableExists = await queryRunner.hasTable("video_posts");
        if (!tableExists) {
            await queryRunner.query(`
                CREATE TABLE "video_posts" (
                    "videoId" uuid NOT NULL,
                    "postId" uuid NOT NULL,
                    PRIMARY KEY ("videoId", "postId"),
                    CONSTRAINT "FK_video_posts_video" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_video_posts_post" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
                )
            `);

            // Crear índices para la tabla de relación
            await queryRunner.query(`
                CREATE INDEX "IDX_video_posts_videoId" ON "video_posts" ("videoId");
                CREATE INDEX "IDX_video_posts_postId" ON "video_posts" ("postId");
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la tabla de relación si existe
        await queryRunner.query(`DROP TABLE IF EXISTS "video_posts"`);
    }

}
