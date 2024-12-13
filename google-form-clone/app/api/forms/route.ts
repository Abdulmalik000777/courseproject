import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, OkPacket } from "mysql2";

export async function GET(req: NextRequest) {
  console.log("GET request to /api/forms");
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement proper token verification and get the actual user ID
    const userId = 1; // Placeholder user ID

    const url = new URL(req.url);
    const formId = url.searchParams.get("id");

    const connection = await pool.getConnection();
    try {
      if (formId) {
        // Fetch a specific form
        const [formRows] = await connection.execute<RowDataPacket[]>(
          "SELECT id, title, description FROM forms WHERE id = ? AND user_id = ?",
          [formId, userId]
        );

        if (formRows.length === 0) {
          return NextResponse.json(
            { message: "Form not found" },
            { status: 404 }
          );
        }

        const form = formRows[0];

        const [questionRows] = await connection.execute<RowDataPacket[]>(
          "SELECT id, question_text, question_type, question_order FROM questions WHERE form_id = ? ORDER BY question_order",
          [formId]
        );

        const questions = await Promise.all(
          questionRows.map(async (question) => {
            if (
              question.question_type === "radio" ||
              question.question_type === "checkbox"
            ) {
              const [optionRows] = await connection.execute<RowDataPacket[]>(
                "SELECT option_text FROM options WHERE question_id = ? ORDER BY option_order",
                [question.id]
              );
              return {
                ...question,
                options: optionRows.map((option) => option.option_text),
              };
            }
            return question;
          })
        );

        form.questions = questions;

        return NextResponse.json({ form }, { status: 200 });
      } else {
        // Fetch all forms for the user
        const [rows] = await connection.execute<RowDataPacket[]>(
          "SELECT id, title, description, created_at FROM forms WHERE user_id = ? ORDER BY created_at DESC",
          [userId]
        );

        return NextResponse.json({ forms: rows }, { status: 200 });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Unexpected error in /api/forms GET route:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, questions } = await req.json();

    // For debugging
    console.log("Received form data:", { title, description, questions });

    // TODO: Implement proper user identification from token
    const userId = 1; // Placeholder user ID

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
