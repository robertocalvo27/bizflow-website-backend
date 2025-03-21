-- CreateTable
CREATE TABLE "automated_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "tags" TEXT NOT NULL,
    "seoMetadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automated_content_pkey" PRIMARY KEY ("id")
);
