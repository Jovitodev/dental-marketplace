import { NextFunction, Request, Response } from "express";
import { userService } from "../../modules/users/user.service";
import { User } from "../../modules/users/user.model";

// Estende o tipo Request do Express para carregar o usuário autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: Omit<User, "passwordHash">;
    }
  }
}

/**
 * Exige um usuário autenticado (qualquer role).
 * Lê o token mock do header "Authorization: Bearer <token>".
 * TODO: substituir a verificação do token mock por validação de JWT real.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Token de autenticação ausente." });
  }

  const user = await userService.getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }

  if (user.status === "BANIDO") {
    return res.status(403).json({ message: "Esta conta foi banida da plataforma." });
  }

  const { passwordHash, ...safeUser } = user;
  req.authUser = safeUser;
  next();
}

/**
 * Exige um usuário autenticado com role === "admin".
 * Deve ser usado sempre em conjunto/depois de requireAuth.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (req.authUser?.role !== "admin") {
      return res.status(403).json({ message: "Acesso restrito a administradores." });
    }
    next();
  });
}
