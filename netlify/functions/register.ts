import type { Context } from "@netlify/functions";
import { neon } from "@netlify/neon";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, password, dob } = body;

    if (!name || !email || !password || !dob) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon();

    const existingUser = await sql(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const passwordHash = hashPassword(password);

    const result = await sql(
      `INSERT INTO users (name, email, password_hash, dob)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at`,
      [
        name,
        email,
        passwordHash,
        dob,
      ]
    );

    const user = result[0];

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/register",
};
