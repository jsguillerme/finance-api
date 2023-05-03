-- CreateTable
CREATE TABLE "credit_card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_card" TEXT NOT NULL,
    "registered_at" TEXT NOT NULL,
    "expired_date" TEXT NOT NULL,
    "limit_value" TEXT NOT NULL,
    "current_balance" TEXT,
    "income_balance" TEXT,
    "outcome_balance" TEXT,
    "number_card" TEXT NOT NULL,
    "surname" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "transaction_card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TEXT NOT NULL,
    "establishment_name" TEXT NOT NULL,
    "spent_value" TEXT NOT NULL,
    "category_establishment" TEXT NOT NULL,
    "type_transaction" TEXT NOT NULL,
    "card_credit_id" TEXT NOT NULL,
    CONSTRAINT "transaction_card_card_credit_id_fkey" FOREIGN KEY ("card_credit_id") REFERENCES "credit_card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category_goal" TEXT NOT NULL,
    "predicted_value" TEXT NOT NULL,
    "expected_date" TEXT NOT NULL,
    "completed" TEXT NOT NULL DEFAULT 'not-completed',
    "created_at" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_id_key" ON "credit_card"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_card_id_key" ON "transaction_card"("id");

-- CreateIndex
CREATE UNIQUE INDEX "goals_id_key" ON "goals"("id");
