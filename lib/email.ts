import { Resend } from 'resend';

// Lazy initialization - only create Resend instance when API key is available
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resend;
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
) {
  const client = getResendClient();
  
  if (!client) {
    console.log('Email notification (Resend not configured):', { to, subject });
    return;
  }

  try {
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendNewOfferEmail(
  clientEmail: string,
  clientName: string,
  agentName: string,
  price: number,
  shipmentId: number
) {
  const subject = `New Offer Received for Shipment #${shipmentId}`;
  const html = `
    <h2>New Offer Received</h2>
    <p>Hello ${clientName},</p>
    <p>You have received a new offer of $${price} from ${agentName} for your shipment #${shipmentId}.</p>
    <p>Please log in to your dashboard to view and accept the offer.</p>
    <p>Best regards,<br>LogiFlow Team</p>
  `;

  await sendEmailNotification(clientEmail, subject, html);
}

export async function sendOfferAcceptedEmail(
  agentEmail: string,
  agentName: string,
  price: number,
  shipmentId: number
) {
  const subject = `Your Offer Has Been Accepted for Shipment #${shipmentId}`;
  const html = `
    <h2>Offer Accepted</h2>
    <p>Hello ${agentName},</p>
    <p>Great news! Your offer of $${price} has been accepted for shipment #${shipmentId}.</p>
    <p>Please log in to your dashboard to view the shipment details and proceed.</p>
    <p>Best regards,<br>LogiFlow Team</p>
  `;

  await sendEmailNotification(agentEmail, subject, html);
}

