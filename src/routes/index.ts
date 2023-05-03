import { FastifyInstance } from 'fastify';
import { z } from 'zod'
import { prisma } from '../lib/prisma';

import dayjs from 'dayjs';
import { FormatNumberCard } from '../utils/formatNumberCard';
import { formatDateToSave } from '../utils/formatDateToSave';
import { protectedNumberCard } from '../utils/protectedNumberCard';
import { calculatorSpentCurrent } from '../utils/calculatorSpentCurrent';

export async function AppRoutes(app: FastifyInstance) {
  /**
   * Route verify health of API
   */
  app.get('/healthCheck', async (_, response) => {
    return response.status(200).send({
      message: 'Health Check OK'
    })
  })
  /**
   * Route create a new goal
   */
  app.post('/goal', async (request, response) => {
    const createGoalBody = z.object({
      title: z.string().nonempty(),
      category_goal: z.string(),
      predicted_value: z.string().nonempty().min(3),
      expected_date: z.string().nonempty(),
      completed: z.string().toLowerCase().transform((val) => {
        if (!(val === 'not-completed' || val === 'completed')) {
          throw new Error('the information that completed or not need to be completed ou not-completed')
        } else {
          return val
        }
      }),
    })

    const { title, completed, expected_date, predicted_value, category_goal } = createGoalBody.parse(request.body);
    const expected_date_formated = expected_date.split('-').reverse().join('/')

    const today = dayjs().startOf('day').toDate().toISOString();
    const todayFormatted = formatDateToSave(today);

    const GoalCreated = await prisma.goals.create({
      data: {
        title: title,
        category_goal: category_goal,
        created_at: todayFormatted,
        completed: completed,
        expected_date: expected_date_formated,
        predicted_value: predicted_value,
      }
    })

    return response.status(201).send({
      message: "Goal created successfully",
      data: GoalCreated
    })
  })
  /**
   * Route get just goal specific
   */
  app.get('/goal/:id', async (request, response) => {
    const goalIdParams = z.object({
      id: z.string().uuid().nonempty()
    })

    const { id } = goalIdParams.parse(request.params);
    let searchGoal = await prisma.goals.findUnique({
      where: {
        id: id
      }
    })

    if (!searchGoal) {
      return response.status(404).send({
        message: 'goal not found in database'
      })
    }

    return response.status(200).send(searchGoal)
  })

  app.put('/goal/:id', async (req, res) => {
    const goalParamsId = z.object({
      id: z.string().uuid().nonempty()
    })

    const goalParamsBody = z.object({
      title: z.string().optional(),
      category_goal: z.string().optional(),
      predicted_value: z.string().min(3).optional(),
      expected_date: z.string().optional(),
      completed: z.string().toLowerCase().transform((val) => {
        if (!(val === 'not-completed' || val === 'completed')) {
          throw new Error('the information that completed or not need to be completed ou not-completed')
        } else {
          return val
        }
      }),
    })

    const { id } = goalParamsId.parse(req.params);
    const { category_goal, completed, expected_date, predicted_value, title } = goalParamsBody.parse(req.body);
    const expected_date_formated = expected_date?.split('-').reverse().join('/')


    // const oldGoal = await prisma.goals.findUnique({
    //   where: {
    //     id: id
    //   }
    // });

    const updatedGoal = await prisma.goals.update({
      where: {
        id: id
      },
      data: {
        title: title,
        category_goal: category_goal,
        completed: completed,
        expected_date: expected_date_formated,
        predicted_value: predicted_value
      }
    });

    return res.status(200).send(updatedGoal)

  })

  app.delete('/goal/:id', async (req, res) => {
    const goalId = z.object({
      id: z.string().uuid().nonempty()
    });

    const { id } = goalId.parse(req.params);

    await prisma.goals.delete({
      where: {
        id: id,
      }
    })

    return res.status(202).send({
      message: 'delete goal successfully'
    })
  })

  /**
   * Route get all goals in database
   */
  app.get('/goal/all', async (_, response) => {
    let searchAllGoals = await prisma.goals.findMany({
      take: 6,
      orderBy: {
        expected_date: 'asc'
      }
    });

    return response.status(200).send(searchAllGoals)
  })

  /**
   * Route get all transactions in database
   */
  app.get('/transactions/all', async (request, response) => {

    const transactionsQuery = z.object({
      page: z.string().nonempty()
    })

    const { page } = transactionsQuery.parse(request.query)

    let searchAllTransactions = await prisma.trasaction.findMany({
      take: 3,
      orderBy: {
        created_at: 'desc'
      }
    })

    return response.status(200).send({
      transactions: searchAllTransactions
    })
  })

  app.post('/transaction', async (request, response) => {
    const transactionBody = z.object({
      establishment_name: z.string().nonempty(),
      spent_value: z.string().nonempty(),
      category_establishment: z.string(),
      card_credit_id: z.string().nonempty(),
      type_transaction: z.string().nonempty().toLowerCase().transform((val) => {
        if (!(val === 'income' || val === 'outcome')) {
          throw new Error('the type of transaction need to be income ou outcome')
        } else {
          return val
        }
      }),
    });

    const { spent_value, establishment_name, category_establishment, card_credit_id, type_transaction } = transactionBody.parse(request.body);

    if (type_transaction === 'income') {
      // const cardCredit = await prisma.cardCredit.findUnique({
      //   where: {
      //     id: card_credit_id
      //   }
      // });

      // const newIncomeBalance = Number(cardCredit?.current_balance) + Number(spent_value);

      // await prisma.cardCredit.update({
      //   where: {
      //     id: card_credit_id,
      //   },
      //   data: {
      //     income_balance: String(newIncomeBalance)
      //   }
      // })
    } else if (type_transaction === 'outcome') {

      const cardCredit = await prisma.cardCredit.findUnique({
        where: {
          id: card_credit_id
        }
      });

      const newCurrentBalance = Number(cardCredit?.current_balance) - Number(spent_value);

      await prisma.cardCredit.update({
        where: {
          id: card_credit_id,
        },
        data: {
          current_balance: String(newCurrentBalance)
        }
      })
    }

    const today = dayjs().toDate().toISOString();
    const todayFormatted = formatDateToSave(today);

    const newTransaction = await prisma.trasaction.create({
      data: {
        category_establishment: category_establishment,
        created_at: todayFormatted,
        establishment_name: establishment_name,
        spent_value: spent_value,
        card_credit_id: card_credit_id,
        type_transaction: type_transaction
      }
    })



    return response.status(201).send({
      message: 'created successfully a new transaction',
      data: newTransaction
    })
  })

  app.delete('/transaction/:id', async (request, response) => {
    const idParams = z.object({
      id: z.string().uuid().nonempty()
    });

    const { id } = idParams.parse(request.params);

    const transactionToDelete = await prisma.trasaction.delete({
      where: { id: id },
      select: {
        card_credit_id: true,
        spent_value: true,
        type_transaction: true
      }
    })

    if (transactionToDelete.type_transaction === 'income') {
      const cardCreditUsed = await prisma.cardCredit.findUnique({
        where: {
          id: transactionToDelete.card_credit_id
        }
      })

      const newBalanceIncome = Number(cardCreditUsed?.income_balance) + Number(transactionToDelete.spent_value);
      await prisma.cardCredit.update({
        where: {
          id: cardCreditUsed?.id
        },
        data: {
          income_balance: String(newBalanceIncome)
        }
      })
    } else if (transactionToDelete.type_transaction === 'outcome') {
      const cardCreditUsed = await prisma.cardCredit.findUnique({
        where: {
          id: transactionToDelete.card_credit_id
        }
      })

      const newBalanceOutcome = Number(cardCreditUsed?.outcome_balance) - Number(transactionToDelete.spent_value);
      const newCurrentBalance = Number(cardCreditUsed?.current_balance) + Number(transactionToDelete.spent_value);
      await prisma.cardCredit.update({
        where: {
          id: cardCreditUsed?.id
        },
        data: {
          income_balance: String(newBalanceOutcome),
          current_balance: String(newCurrentBalance)
        }
      })
    }

    return response.status(202).send({
      message: 'Transaction deleted successfully'
    })

  })

  app.get('/cards', async (_, response) => {
    const findAllCardsCredit = await prisma.cardCredit.findMany();

    if (findAllCardsCredit) {
      findAllCardsCredit.map((card) => {
        card.number_card = protectedNumberCard(card.number_card);
      })

      return response.status(200).send(findAllCardsCredit)
    } else {
      return response.status(404).send({
        message: 'Cards not found'
      })
    }

  })

  app.get('/cards/:id', async (request, response) => {
    const cardIdParam = z.object({
      id: z.string().uuid().nonempty()
    })

    const { id } = cardIdParam.parse(request.params);

    const cardFound = await prisma.cardCredit.findUnique({
      where: {
        id: id
      }
    })

    if (cardFound) {
      cardFound.number_card = protectedNumberCard(cardFound.number_card)
      return response.status(200).send(cardFound)
    } else {
      return response.status(409).send({
        message: 'Card not found'
      })
    }
  })

  app.post('/card', async (request, response) => {
    const regex = /\/D/gm;

    const cardBody = z.object({
      owner_card: z.string().nonempty().toUpperCase(),
      expired_date: z.string(),
      limit_value: z.string().nonempty(),
      surname: z.string().nonempty(),
      income_balance: z.string().optional(),
      outcome_balance: z.string().optional(),
      number_card: z.string().transform((val) => {
        return FormatNumberCard(val)
      })
    })

    const { owner_card, outcome_balance, limit_value, number_card, expired_date, income_balance, surname } = cardBody.parse(request.body);

    const today = dayjs().startOf('day').toDate().toISOString();
    const todayFormatted = formatDateToSave(today);

    const newCardAdd = await prisma.cardCredit.create({
      data: {
        registered_at: todayFormatted,
        current_balance: limit_value,
        expired_date: expired_date,
        income_balance: income_balance,
        limit_value: limit_value,
        number_card: number_card,
        outcome_balance: outcome_balance,
        owner_card: owner_card,
        surname: surname
      }
    });

    return response.status(200).send({
      message: 'Success card added',
      data: newCardAdd
    })
  })

  app.put('/card/:id/outcome', async (request, response) => {
    const cardIdParams = z.object({
      id: z.string().uuid().nonempty()
    })

    const cardSpentBody = z.object({
      new_spent: z.string().nonempty()
    })

    const { id } = cardIdParams.parse(request.params);
    const { new_spent } = cardSpentBody.parse(request.body);

    const oldCard = await prisma.cardCredit.findUnique({
      where: {
        id: id
      }
    })

    let currentSpent = calculatorSpentCurrent(oldCard?.outcome_balance || "0", new_spent)

    const updateCard = await prisma.cardCredit.update({
      where: {
        id: id
      },
      data: {
        outcome_balance: currentSpent
      },
      select: {
        limit_value: true,
        outcome_balance: true,
        income_balance: true,
      }
    })

    return response.status(200).send({
      message: 'card updated successfully',
      data: updateCard
    })
  })

  app.put('/card/:id/income', async (request, response) => {
    const cardIdParams = z.object({
      id: z.string().uuid().nonempty()
    })

    const cardSpentBody = z.object({
      new_spent: z.string().nonempty()
    })

    const { id } = cardIdParams.parse(request.params);
    const { new_spent } = cardSpentBody.parse(request.body);

    const oldCard = await prisma.cardCredit.findUnique({
      where: {
        id: id
      }
    })

    let currentSpent = calculatorSpentCurrent(oldCard?.income_balance || "0", new_spent)

    const updateCard = await prisma.cardCredit.update({
      where: {
        id: id
      },
      data: {
        income_balance: currentSpent
      },
      select: {
        limit_value: true,
        outcome_balance: true,
        income_balance: true,
      }
    })

    return response.status(200).send({
      message: 'card updated successfully',
      data: updateCard
    })
  })
}
