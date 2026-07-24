import "dotenv/config"
import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import type { NestExpressApplication } from "@nestjs/platform-express"
import { toNodeHandler } from "better-auth/node"
import { json, urlencoded } from "express"
import { AppModule } from "./app.module"
import { auth, trustedOrigins } from "./auth/auth"

async function bootstrap() {
  // bodyParser off: Better Auth's handler must read the raw request stream,
  // so JSON parsing is added manually AFTER the auth routes are mounted.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })

  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  })

  const server = app.getHttpAdapter().getInstance()
  server.all(/^\/api\/auth\/.*/, toNodeHandler(auth))
  server.use(json({ limit: "1mb" }))
  server.use(urlencoded({ extended: true }))

  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
  console.log(`API ready on http://localhost:${port}`)
}

bootstrap()
