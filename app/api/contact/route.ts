import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Log the contact form submission
    console.log("=== New Contact Form Submission ===");
    console.log(`Name: ${body.name}`);
    console.log(`Email: ${body.email}`);
    console.log(`Message: ${body.message}`);
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
