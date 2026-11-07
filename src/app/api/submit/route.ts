import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generatePdfBuffer, ClientSubmissionData } from '@/lib/generatePdf';
import { saveOrUpdateSubmission } from '@/lib/submissionsStore';

interface SubmissionPayload extends Partial<ClientSubmissionData> {
  id?: string;
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

    // 3. Save / Update structured record in data/submissions.json (Admin Dashboard data store)
    const savedRecord = saveOrUpdateSubmission({
      id: data.id,
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

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const absolutePdfUrl = `${origin}${pdfUrl}`;

    console.log(`[Admin Record Saved] Stage: ${stage} | ID: ${savedRecord.id} | PDF: ${fileName}`);

    return NextResponse.json({
      success: true,
      id: savedRecord.id,
      stage,
      fileName,
      pdfUrl,
      absolutePdfUrl,
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
