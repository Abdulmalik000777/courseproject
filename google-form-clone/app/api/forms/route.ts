import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    // TODO: Implement proper token verification
    // For now, we'll just check if the token exists
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get the actual user ID from the token
    const userId = 1; // Placeholder user ID

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT f.id, f.title, f.description, f.created_at, 
          COUNT(DISTINCT fs.id) as responseCount
       FROM forms f
       LEFT JOIN form_submissions fs ON f.id = fs.form_id
       WHERE f.user_id = ?
       GROUP BY f.id
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return NextResponse.json(
      {
        forms: rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          created_at: row.created_at,
          responseCount: row.responseCount,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { message: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    // TODO: Implement proper token verification
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, questions } = await req.json();

    // For debugging
    console.log("Received form data:", { title, description, questions });

    // TODO: Implement proper user identification from token
    // For now, we'll use a placeholder user ID
    const userId = 1;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<OkPacket>(
        "INSERT INTO forms (user_id, title, description) VALUES (?, ?, ?)",
        [userId, title, description]
      );

      const formId = result.insertId;

      for (const question of questions) {
        const [questionResult] = await connection.execute<OkPacket>(
          "INSERT INTO questions (form_id, question_text, question_type, question_order) VALUES (?, ?, ?, ?)",
          [formId, question.question, question.type, question.order || 0]
        );

        const questionId = questionResult.insertId;

        if (question.options) {
          for (let i = 0; i < question.options.length; i++) {
            await connection.execute(
              "INSERT INTO options (question_id, option_text, option_order) VALUES (?, ?, ?)",
              [questionId, question.options[i], i]
            );
          }
        }
      }

      await connection.commit();

      return NextResponse.json(
        { message: "Form created successfully", formId },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Failed to create form", error: (error as Error).message },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { message: "Failed to create form", error: (error as Error).message },
      { status: 500 }
    );
  }
}
