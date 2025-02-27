import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { ResumeContentObject } from '@/types';

export class PDFGenerator {
  private async createDocument() {
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    return { pdfDoc, timesRoman, timesBold };
  }

  async generateResume(resume: ResumeContentObject): Promise<Uint8Array> {
    const { pdfDoc, timesRoman, timesBold } = await this.createDocument();
    let page = pdfDoc.addPage([612, 792]); // Standard US Letter size

    // Set initial cursor position
    let yOffset = page.getHeight() - 50;
    const margin = 50;
    const pageBottom = margin; // Bottom margin

    // Function to check if we need a new page
    const checkForNewPage = (requiredSpace: number = 50) => {
      if (yOffset < pageBottom + requiredSpace) {
        page = pdfDoc.addPage([612, 792]);
        yOffset = page.getHeight() - 50;
        return true;
      }
      return false;
    };

    // Header section
    page.drawText(resume.name, {
      x: margin,
      y: yOffset,
      size: 24,
      font: timesBold,
      color: rgb(0, 0, 0),
    });

    yOffset -= 25;

    // Contact information
    const contactText = `${resume.contact.email} | ${resume.contact.phone}${
      resume.contact.linkedin ? ` | ${resume.contact.linkedin}` : ''
    }${resume.contact.website ? ` | ${resume.contact.website}` : ''}`;

    page.drawText(contactText, {
      x: margin,
      y: yOffset,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });

    yOffset -= 25;

    // Location
    page.drawText(resume.location, {
      x: margin,
      y: yOffset,
      size: 10,
      font: timesRoman,
      color: rgb(0, 0, 0),
    });

    yOffset -= 30;

    // Summary section
    checkForNewPage(80); // Check if we need a new page for summary
    this.drawSection(page, 'SUMMARY', timesBold, margin, yOffset);
    yOffset -= 20;
    yOffset = this.drawWrappedText(page, resume.summary, timesRoman, margin, yOffset, 10);
    yOffset -= 20;

    // Skills section
    checkForNewPage(60); // Check if we need a new page for skills
    this.drawSection(page, 'SKILLS', timesBold, margin, yOffset);
    yOffset -= 20;
    yOffset = this.drawWrappedText(
      page,
      resume.skills.join(' • '),
      timesRoman,
      margin,
      yOffset,
      10
    );
    yOffset -= 20;

    // Experience section
    checkForNewPage(60); // Check if we need a new page for experience
    this.drawSection(page, 'EXPERIENCE', timesBold, margin, yOffset);
    yOffset -= 20;

    for (const exp of resume.experience) {
      // Check if we need a new page for this experience entry
      checkForNewPage(70);
      
      page.drawText(exp.company, {
        x: margin,
        y: yOffset,
        size: 12,
        font: timesBold,
      });

      page.drawText(exp.dates, {
        x: page.getWidth() - margin - 100,
        y: yOffset,
        size: 10,
        font: timesRoman,
      });

      yOffset -= 20;

      page.drawText(exp.title, {
        x: margin,
        y: yOffset,
        size: 11,
        font: timesRoman,
        color: rgb(0.3, 0.3, 0.3),
      });

      yOffset -= 15;

      for (const detail of exp.details) {
        // Check if we need a new page for this detail
        if (checkForNewPage(30)) {
          // If we added a new page, we need to redraw the bullet point
          page.drawText('•', {
            x: margin,
            y: yOffset,
            size: 10,
            font: timesRoman,
          });
        } else {
          const bulletY = yOffset;
          page.drawText('•', {
            x: margin,
            y: bulletY,
            size: 10,
            font: timesRoman,
          });
        }

        yOffset = this.drawWrappedText(
          page,
          detail,
          timesRoman,
          margin + 15,
          yOffset,
          10,
          500,
          checkForNewPage
        );
        yOffset -= 10;
      }

      yOffset -= 15;
    }

    // Education section
    checkForNewPage(60); // Check if we need a new page for education
    this.drawSection(page, 'EDUCATION', timesBold, margin, yOffset);
    yOffset -= 20;

    for (const edu of resume.education) {
      // Check if we need a new page for this education entry
      checkForNewPage(60);
      
      page.drawText(edu.institution, {
        x: margin,
        y: yOffset,
        size: 12,
        font: timesBold,
      });

      page.drawText(edu.dates, {
        x: page.getWidth() - margin - 100,
        y: yOffset,
        size: 10,
        font: timesRoman,
      });

      yOffset -= 20;

      page.drawText(edu.degree, {
        x: margin,
        y: yOffset,
        size: 11,
        font: timesRoman,
      });

      yOffset -= 25;
    }

    return pdfDoc.save();
  }

  private drawSection(
    page: PDFPage,
    text: string,
    font: PDFFont,
    x: number,
    y: number
  ) {
    page.drawText(text.toUpperCase(), {
      x,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
  }

  private drawWrappedText(
    page: PDFPage,
    text: string,
    font: PDFFont,
    x: number,
    y: number,
    size: number,
    maxWidth: number = 500,
    pageBreakCallback?: (requiredSpace: number) => boolean
  ): number {
    const words = text.split(' ');
    let line = '';
    let yPos = y;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, size);

      if (width > maxWidth && line) {
        // Check if we need a new page before drawing this line
        if (pageBreakCallback && pageBreakCallback(size + 2)) {
          yPos = page.getHeight() - 50;
        }
        
        page.drawText(line, {
          x,
          y: yPos,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        line = word;
        yPos -= size + 2;
      } else {
        line = testLine;
      }
    }

    if (line) {
      // Check if we need a new page before drawing the last line
      if (pageBreakCallback && pageBreakCallback(size + 2)) {
        yPos = page.getHeight() - 50;
      }
      
      page.drawText(line, {
        x,
        y: yPos,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    }

    return yPos - (size + 2);
  }
}
