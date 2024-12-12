import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows]: any = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("Password mismatch for user:", email);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Login successful for user:", email);
    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
