import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { OkPacket, RowDataPacket } from "mysql2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // TODO: Get the actual user ID from the token
    const userId = 1; // Placeholder user ID

    const formId = resolvedParams.id;

    const connection = await pool.getConnection();
    try {
      const [formRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id, title, description FROM forms WHERE id = ?",
        [formId]
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
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { message: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = 1; // Placeholder user ID
    const formId = resolvedParams.id;
    const { title, description, questions } = await req.json();

    if (!title || !Array.isArray(questions)) {
      return NextResponse.json(
        { message: "Invalid form data" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE forms SET title = ?, description = ? WHERE id = ? AND user_id = ?",
        [title, description || "", formId, userId]
      );

      await connection.execute(
        "DELETE o FROM options o JOIN questions q ON o.question_id = q.id WHERE q.form_id = ?",
        [formId]
      );
      await connection.execute("DELETE FROM questions WHERE form_id = ?", [
        formId,
      ]);

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question || !question.type) {
          console.error("Invalid question data:", question);
          continue; // Skip this question if it's invalid
        }

        const [questionResult] = await connection.execute<OkPacket>(
          "INSERT INTO questions (form_id, question_text, question_type, question_order) VALUES (?, ?, ?, ?)",
          [formId, question.question, question.type, i]
        );

        const questionId = questionResult.insertId;

        if (question.options && Array.isArray(question.options)) {
          for (let j = 0; j < question.options.length; j++) {
            if (question.options[j]) {
              await connection.execute(
                "INSERT INTO options (question_id, option_text, option_order) VALUES (?, ?, ?)",
                [questionId, question.options[j], j]
              );
            }
          }
        }
      }

      await connection.commit();
      return NextResponse.json(
        { message: "Form updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      await connection.rollback();
      console.error("Error in transaction:", error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { message: "Failed to update form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = 1; // Placeholder user ID
    const formId = resolvedParams.id;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "DELETE o FROM options o JOIN questions q ON o.question_id = q.id WHERE q.form_id = ?",
        [formId]
      );

      await connection.execute("DELETE FROM questions WHERE form_id = ?", [
        formId,
      ]);

      const [result] = await connection.execute<OkPacket>(
        "DELETE FROM forms WHERE id = ? AND user_id = ?",
        [formId, userId]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "Form not found or not owned by user" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Form deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      await connection.rollback();
      console.error("Error in transaction:", error);
      return NextResponse.json(
        { message: "Failed to delete form" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { message: "Failed to delete form" },
      { status: 500 }
    );
  }
}
