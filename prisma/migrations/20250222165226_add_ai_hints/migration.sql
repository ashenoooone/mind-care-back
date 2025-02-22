-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "aiHints" TEXT;

-- CreateTable
CREATE TABLE "AiHint" (
    "id" SERIAL NOT NULL,
    "hint" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "AiHint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiHint" ADD CONSTRAINT "AiHint_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiHint" ADD CONSTRAINT "AiHint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
