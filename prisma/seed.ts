import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const firstCardCreditId = '0730ffac-d039-4194-9571-01aa2aa0efbd';

const firstTransactionId = '00880d75-a933-4fef-94ab-e05744435297';

const firstGoalId = 'fa1a1bcf-3d87-4626-8c0d-d7fd1255ac00';



async function run() {
  await prisma.trasaction.deleteMany();
  await prisma.goals.deleteMany();
  await prisma.cardCredit.deleteMany();

  /** 
   * Create a new Card
  */
  await Promise.all([
    // prisma.cardCredit.create({
    //   data: {
    //     id: firstCardCreditId,
    //     owner_card: "JOSE G A MORAIS",
    //     expired_date: "01/31",
    //     limit_value: "2500",
    //     registered_at: String(new Date('2023-04-21T03:00:00.000')),
    //     number_card: "4540 5425 5421 0543",
    //     surname: "apelido_teste"
    //   }
    // }),

    // prisma.trasaction.create({
    //   data: {
    //     id: firstTransactionId,
    //     establishment_name: "MarketPlace John",
    //     spent_value: "450",
    //     created_at: String(new Date('2023-04-21T03:00:00.000')),
    //     category_establishment: "Shopping",
    //     card_credit_id: firstCardCreditId,
    //     type_transaction: "income",
    //   }
    // }),

    // prisma.goals.create({
    //   data: {
    //     id: firstGoalId,
    //     title: "Travel",
    //     predicted_value: "4500",
    //     expected_date: String(new Date('2023-04-21T03:00:00.000')),
    //     completed: false,
    //     category_goal: "Personal",
    //     created_at:  String(new Date('2023-04-21T03:00:00.000')),
    //   }
    // })
  ])
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  })