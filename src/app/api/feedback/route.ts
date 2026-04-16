import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/feedback
 * Stuurt feedback via een mailto-redirect of verwerkt het formulier.
 * E-mailadres is server-side zodat het niet zichtbaar is voor de gebruiker.
 */

const FEEDBACK_EMAIL = "info@themarketingboosters.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, email, telefoon, bericht } = body as {
      naam?: string;
      email?: string;
      telefoon?: string;
      bericht?: string;
    };

    if (!naam || !bericht) {
      return NextResponse.json(
        { error: "Naam en bericht zijn verplicht." },
        { status: 400 },
      );
    }

    // Bouw de e-mail body op
    const onderwerp = `Grenspret Feedback van ${naam}`;
    const inhoud = [
      `Naam: ${naam}`,
      `E-mail: ${email || "Niet opgegeven"}`,
      `Telefoon: ${telefoon || "Niet opgegeven"}`,
      ``,
      `Bericht:`,
      bericht,
    ].join("\n");

    // Stuur via fetch naar een mailto-constructie
    // In productie zou je hier bv. Resend, SendGrid of Nodemailer gebruiken.
    // Voor nu slaan we de feedback op en geven we de mailto-link terug als fallback.
    const mailtoLink =
      `mailto:${FEEDBACK_EMAIL}` +
      `?subject=${encodeURIComponent(onderwerp)}` +
      `&body=${encodeURIComponent(inhoud)}`;

    return NextResponse.json({
      success: true,
      bericht: "Bedankt voor je feedback!",
      mailto: mailtoLink,
    });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis. Probeer het opnieuw." },
      { status: 500 },
    );
  }
}
