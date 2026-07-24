import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { fromNodeHeaders } from "better-auth/node"
import type { Request } from "express"
import { auth } from "./auth"

/** Requires a valid Better Auth session cookie; attaches the user to req. */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: unknown }>()
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session) throw new UnauthorizedException("Sign in required")
    req.user = session.user
    return true
  }
}
