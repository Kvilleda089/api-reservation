-- CreateTable
CREATE TABLE "user_session" (
    "id" TEXT NOT NULL,
    "employeeId" UUID NOT NULL,
    "tokenId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_tokenId_key" ON "user_session"("tokenId");

-- CreateIndex
CREATE INDEX "user_session_employeeId_idx" ON "user_session"("employeeId");

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
