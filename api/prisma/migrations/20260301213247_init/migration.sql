-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('ARCADE', 'ROGUELITE', 'DUEL');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('CURRENT_QUESTION', 'NEXT_QUESTION', 'PASSIVE', 'ROUND');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('NONE', 'ON_WIN', 'ON_LOSS', 'IS_CATEGORY', 'IS_NOT_CATEGORY');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('REMOVE_OPTION', 'EXTRA_CHANCE', 'REVEAL_ANSWER', 'MULTIPLY_TIME', 'MULTIPLY_SCORE', 'CHANGE_CATEGORY', 'ADD_QUESTION', 'REMOVE_QUESTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "coins" INTEGER NOT NULL DEFAULT 0,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tmdbId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "posterPath" TEXT,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "powerUpTrigger" "TriggerType",
    "powerUpCondition" "ConditionType",
    "powerUpAction" "ActionType",
    "powerUpValue" INTEGER,
    "targetCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL DEFAULT 'ARCADE',
    "score" INTEGER NOT NULL DEFAULT 0,
    "auditLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Card_tmdbId_key" ON "Card"("tmdbId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_targetCategoryId_fkey" FOREIGN KEY ("targetCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
