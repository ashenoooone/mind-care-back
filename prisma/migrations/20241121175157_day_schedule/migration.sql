-- CreateTable
CREATE TABLE "DaySchedule" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,

    CONSTRAINT "DaySchedule_pkey" PRIMARY KEY ("id")
);
