import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("JWT_SECRET no está configurado (revisa el archivo .env)");
}
const JWT_SECRET: string = rawSecret;

export const AUTH_COOKIE_NAME = "julius_session";

export interface TokenPayload {
  userId: string;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || typeof decoded.userId !== "string") return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
