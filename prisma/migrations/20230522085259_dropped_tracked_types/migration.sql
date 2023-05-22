/*
  Warnings:

  - You are about to drop the `TrackedTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackedTaskCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TrackedTask";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TrackedTaskCompletion";
PRAGMA foreign_keys=on;
