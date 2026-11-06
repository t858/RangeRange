import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generatePdfBuffer, ClientSubmissionData } from '@/lib/generatePdf';
import { saveOrUpdateSubmission } from '@/lib/submissionsStore';

const TARGET_WHATSAPP_PHONE = '2349076042815'; // 09076042815 in international Nigerian format (+234)

interface SubmissionPayload extends ClientSubmissionData {
  stage?: 'eligibility_passed' | 'appointment_booked';
}

export async function POST(req: NextRequest) {
  try {
    const data: SubmissionPayload = await req.json();
    const stage = data.stage || (data.bookingTime ? 'appointment_booked' : 'eligibility_passed');

    // 1. Generate the PDF
    const pdfBuffer = generatePdfBuffer(data);

    // 2. Ensure public/submissions folder exists
    const submissionsDir = path.join(process.cwd(), 'public', 'submissions');
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = (data.firstName || 'Client').replace(/[^a-zA-Z0-9]/g, '');
    const stagePrefix = stage === 'appointment_booked' ? 'Booked' : 'Eligible';
    const fileName = `RangeRange_${stagePrefix}_${safeName}_${timestamp}.pdf`;
    const filePath = path.join(submissionsDir, fileName);

    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `/submissions/${fileName}`;

    // 2.5 Save / Update structured record in data/submissions.json
    saveOrUpdateSubmission({
      stage,
      iraAmount: data.iraAmount,
      focusAreas: data.focusAreas,
      firstName: data.firstName,
      lastName: data.lastName,
      hasHadAdvisor: data.hasHadAdvisor,
      concerns: data.concerns,
      otherConcern: data.otherConcern,
      household: data.household,
      householdIncome: data.householdIncome,
      email: data.email,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      phone: data.phone,
      smsConsent: data.smsConsent,
      pdfUrl,
    });

    // 3. Format WhatsApp payload for Admin (09076042815)
    const fullName = `${data.firstName || 'Drake'} ${data.lastName || 'Hampton'}`.trim();
    const focusList = (data.focusAreas && data.focusAreas.length > 0)
      ? data.focusAreas.join(', ')
      : 'Investments, Retirement planning';
    const concernList = (data.concerns && data.concerns.length > 0)
      ? data.concerns.join(', ')
      : 'Investments check';

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const absolutePdfUrl = `${origin}${pdfUrl}`;

    const isBooking = stage === 'appointment_booked';

    const textMessage = isBooking
      ? [
          `🔔 *RangeRange - NEW APPOINTMENT BOOKED*`,
          `-----------------------------------------`,
          `👤 *Client Name:* ${fullName}`,
          `📧 *Email:* ${data.email || 'N/A'}`,
          `📞 *Phone:* ${data.phone || 'N/A'}`,
          `📅 *Confirmed Appointment:* ${data.bookingDate || 'Upcoming'} at ${data.bookingTime || '2:30pm'}`,
          `💰 *IRA Assets:* ${data.iraAmount || 'N/A'}`,
          `🎯 *Focus Areas:* ${focusList}`,
          `💼 *Had Advisor:* ${data.hasHadAdvisor === 'yes' ? 'Yes' : 'No'}`,
          `⚠️ *Concerns:* ${concernList}`,
          `👨‍👩‍👧 *Household:* ${(data.household || []).join(', ') || 'N/A'}`,
          `💵 *Household Income:* ${data.householdIncome || 'N/A'}`,
          `-----------------------------------------`,
          `📄 *Client PDF Record:*`,
          `${absolutePdfUrl}`,
          `-----------------------------------------`,
          `_Notice for Admin (09076042815)_`,
        ].join('\n')
      : [
          `⚡ *RangeRange - ELIGIBILITY PASSED (New Lead)*`,
          `-----------------------------------------`,
          `👤 *Client Name:* ${fullName}`,
          `📧 *Email:* ${data.email || 'N/A'}`,
          `💰 *IRA Assets:* ${data.iraAmount || 'N/A'}`,
          `🎯 *Focus Areas:* ${focusList}`,
          `💼 *Had Advisor:* ${data.hasHadAdvisor === 'yes' ? 'Yes' : 'No'}`,
          `⚠️ *Concerns:* ${concernList}`,
          `👨‍👩‍👧 *Household:* ${(data.household || []).join(', ') || 'N/A'}`,
          `💵 *Household Income:* ${data.householdIncome || 'N/A'}`,
          `-----------------------------------------`,
          `📄 *Download Application PDF:*`,
          `${absolutePdfUrl}`,
          `-----------------------------------------`,
          `_Client is currently selecting an appointment time on Step 10_`,
        ].join('\n');

    const whatsAppUrl = `https://api.whatsapp.com/send?phone=${TARGET_WHATSAPP_PHONE}&text=${encodeURIComponent(textMessage)}`;

    // 4. Optional automated server-side webhook/gateway dispatch if WHATSAPP_API_URL or WHATSAPP_ACCESS_TOKEN is configured
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (whatsappApiUrl && whatsappToken) {
      try {
        await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${whatsappToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: TARGET_WHATSAPP_PHONE,
            type: 'text',
            text: { body: textMessage },
          }),
        });
      } catch (gatewayErr) {
        console.warn('Optional WhatsApp direct gateway dispatch failed:', gatewayErr);
      }
    }

    console.log(`[Admin Dispatch -> 09076042815] Stage: ${stage} | PDF: ${fileName} | URL: ${absolutePdfUrl}`);

    return NextResponse.json({
      success: true,
      stage,
      fileName,
      pdfUrl,
      absolutePdfUrl,
      whatsAppUrl,
      targetPhone: '09076042815',
    });
  } catch (error) {
    console.error('Failed to generate PDF or submit lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Direct endpoint to download latest or sample generated PDF
  try {
    const searchParams = req.nextUrl.searchParams;
    const file = searchParams.get('file');

    if (file) {
      const filePath = path.join(process.cwd(), 'public', 'submissions', path.basename(file));
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${path.basename(file)}"`,
          },
        });
      }
    }

    return NextResponse.json({ message: 'RangeRange Submission API' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
