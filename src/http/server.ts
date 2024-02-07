import fastify from "fastify"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const app = fastify()
const prisma = new PrismaClient()

app.get("/", (req, res) => {
  return "home"
})

app.post("/polls", async (request, reply) => {
  const createPollBody = z.object({
    title: z.string(),
  })

  const { title } = createPollBody.parse(request.body)

  try {
    const poll = await prisma.poll.create({
      data: {
        title,
      },
    })
    return reply.status(201).send({ pollId: poll.id })
  } catch (error) {
    console.log(error)
    return "❌ Error, poll not created"
  }
})

const port = 3000
app
  .listen({
    port,
  })
  .then(() => {
    console.log(`Server running on http://localhost:${port}`)
  })
