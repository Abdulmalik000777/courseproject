import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { OkPacket } from "mysql2";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const formId = resolvedParams.id;
    const { responses } = await req.json();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<OkPacket>(
        "INSERT INTO form_submissions (form_id) VALUES (?)",
        [formId]
      );

      const submissionId = result.insertId;

      for (const [questionId, answer] of Object.entries(responses)) {
        if (Array.isArray(answer)) {
          // Handle checkbox responses
          for (const option of answer) {
            await connection.execute(
              "INSERT INTO submission_answers (submission_id, question_id, answer) VALUES (?, ?, ?)",
              [submissionId, questionId, option]
            );
          }
        } else {
          // Handle other question types
          await connection.execute(
            "INSERT INTO submission_answers (submission_id, question_id, answer) VALUES (?, ?, ?)",
            [submissionId, questionId, answer]
          );
        }
      }

      await connection.commit();

      return NextResponse.json(
        { message: "Form submitted successfully" },
        { status: 200 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { message: "Failed to submit form" },
      { status: 500 }
    );
  }
}
