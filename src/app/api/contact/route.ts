import { siteConfig } from '@/config/site';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, meeting } = await request.json();

    // Validate required fields (email is now optional)
    if (!name || !subject || !message) {
      console.log('[DEBUG] Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Name, subject, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format only if email is provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('[DEBUG] Validation failed: invalid email format');
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Check if Resend is configured
    if (!resend) {
      console.log('[DEBUG] Resend not configured - skipping email send');
      return NextResponse.json(
        {
          error:
            'Email service is not configured. Please use the email link instead.',
          data: null,
        },
        { status: 503 }
      );
    }

    // Send email using Resend
    const emailDestination = siteConfig.email;
    const { data, error } = await resend.emails.send({
      from: `${siteConfig.name} Portfolio <${process.env.FROM_EMAIL || 'noreply@portfolio.com'}>`,
      to: [emailDestination],
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            ${meeting ? `<p style='margin-top:16px;'><strong>Meeting Requested:</strong> ${new Date(meeting).toLocaleDateString()}</p>` : ''}
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This message was sent from your portfolio contact form at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email to user if email is provided
    let userEmailSent = false;
    if (email && resend) {
      try {
        const { data: userData, error: userError } = await resend.emails.send({
          from: `${siteConfig.name} Portfolio <${process.env.FROM_EMAIL || siteConfig.email}>`,
          to: [email],
          subject: `✅ Message Sent Successfully - ${siteConfig.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">✅ Your Message Has Been Sent!</h2>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-size: 16px; color: #065f46;">
                  Hi ${name},<br><br>
                  Thank you so much for reaching out! Your message has been successfully submitted and I truly appreciate you taking the time to contact me.
                </p>
              </div>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">📋 Message Summary</h3>
                <p><strong>Your Name:</strong> ${name}</p>
                <p><strong>Your Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981; margin-top: 15px;">
                  <strong>Your Message:</strong><br>
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">📞 What Happens Next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>I'll send a personalized response within 24-48 hours</li>
                  <li>In the meantime, feel free to explore more about my work at <a href="${siteConfig.url}" style="color: #2563eb;">${siteConfig.url}</a></li>
                </ul>
                
                <p style="color: #334155; font-size: 16px;">Best regards,<br><strong>${siteConfig.name}</strong></p>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                          📧 ${siteConfig.email}<br>
        🔗 <a href="${siteConfig.url}" style="color: #2563eb;">${siteConfig.url}</a><br>
                  🎯 ${siteConfig.title}<br><br>
                  <em>${siteConfig.description}</em>
                </p>
              </div>
            </div>
          `,
        });

        if (userError) {
          console.error('User confirmation email error:', userError);
          // Don't fail the whole request if user email fails, but log it
        } else {
          userEmailSent = true;
          console.log('User confirmation email sent successfully');
        }
      } catch (userEmailError) {
        console.error('User email exception:', userEmailError);
        // Don't fail the whole request if user email fails
      }
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data, userEmailSent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
