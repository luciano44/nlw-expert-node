import fastify from "fastify"
import { z } from "zod"
import cookie from "@fastify/cookie"
import prisma from "../lib/prisma"
import websocket from "@fastify/websocket"

// Routes Import

import { createPoll } from "./routes/create-poll"
import { getPoll } from "./routes/get-poll"
import { voteOnPoll } from "./routes/vote-on-poll"
import { pollResults } from "./ws/poll-results"

const app = fastify()

app.register(cookie, {
  secret: "polls-app-nlw-secret",
  hook: "onRequest",
})

app.register(websocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
app.register(pollResults)

const port = 3000
app
  .listen({
    port,
  })
  .then(() => {
    console.log(`Server running on http://localhost:${port}`)
  })
