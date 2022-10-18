-- CreateTable
CREATE TABLE "TrackedTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'New task',
    "pageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackedTask_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackedTaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackedTaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TrackedTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL DEFAULT 'New task',
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Note_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("categoryId", "completedAt", "content", "createdAt", "id", "updatedAt") SELECT "categoryId", "completedAt", "content", "createdAt", "id", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
