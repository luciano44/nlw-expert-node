import { FastifyInstance } from "fastify"
import { z } from "zod"
import prisma from "../../lib/prisma"
import { redis } from "../../lib/redis"

export async function getPoll(app: FastifyInstance) {
  app.get("/polls/:pollId", async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!poll) {
      return reply.status(400).send({ msg: "Poll not found" })
    }

    const result = await redis.zrange(pollId, 0, -1, "WITHSCORES")

    const votes: Record<string, number> = {}

    // Convert result votes string into object voteOptionId:voteCount format
    for (let i = 0; i < result.length; i = i + 2) {
      const voteId = result[i]
      const voteCount = parseInt(result[i + 1])

      votes[voteId] = voteCount
    }

    console.log(votes)

    return reply.send({
      id: poll.id,
      title: poll.title,
      options: poll.options.map((option) => {
        return {
          id: option.id,
          title: option.title,
          score: option.id in votes ? votes[option.id] : 0,
        }
      }),
    })
  })
}
