import { NextRequest, NextResponse } from "next/server";
import { contactForm } from '@/lib/api/schemas';
import { validationError } from '@/lib/api/responses';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactForm.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, email, message } = parsed.data;

    // Log the contact form submission
    console.log("=== New Contact Form Submission ===");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("===================================");

    // TODO: In production, you would:
    // 1. Send an email using SendGrid, AWS SES, or similar
    // 2. Save to a database for tracking
    // 3. Send a confirmation email to the user

    // For now, just return success
    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon."
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Return 405 for non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
