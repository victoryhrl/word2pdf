import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
    let browser = null;

    try {
        console.log("Step 1: Received request");
        const formData = await req.formData();
        console.log("Step 2: Parsed formData");

        const file = formData.get("file") as File;
        const watermark = formData.get("watermark") as string | null;
        console.log("Step 3: Got file:", file?.name, file?.size, "Watermark:", watermark);

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log("Step 4: Converting to buffer");
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log("Step 5: Buffer created, size:", buffer.length);

        console.log("Step 6: Extracting content with mammoth (with images)");
        // Use mammoth to convert to HTML with images embedded as base64
        const { value: htmlContent } = await mammoth.convertToHtml(
            { buffer },
            {
                convertImage: mammoth.images.imgElement(async (image) => {
                    const imageBuffer = await image.read("base64");
                    return {
                        src: `data:${image.contentType};base64,${imageBuffer}`,
                    };
                }),
            }
        );
        console.log("Step 7: HTML extracted, length:", htmlContent.length);

        console.log("Step 8: Launching Puppeteer");
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        console.log("Step 9: Page created");

        // Generate watermark CSS if provided
        const watermarkStyles = watermark ? `
          .watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .watermark span {
            font-size: 60px;
            color: rgba(0, 0, 0, 0.08);
            transform: rotate(-45deg);
            white-space: nowrap;
            font-weight: bold;
          }
          @media print {
            .watermark { display: flex !important; }
          }
        ` : '';

        const watermarkHtml = watermark ? `<div class="watermark"><span>${watermark}</span></div>` : '';

        // Create HTML document with Chinese font support
        const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
          
          body {
            font-family: 'Noto Sans SC', 'Microsoft YaHei', 'SimSun', sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }
          
          p {
            margin-bottom: 12px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 12px;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          ${watermarkStyles}
        </style>
      </head>
      <body>
        ${watermarkHtml}
        ${htmlContent}
      </body>
      </html>
    `;

        console.log("Step 10: Setting page content");
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        console.log("Step 11: Generating PDF");
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
            printBackground: true,
        });

        console.log("Step 12: PDF generated, size:", pdfBuffer.length);

        await browser.close();
        browser = null;
        console.log("Step 13: Browser closed");

        const outputFileName = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
        const encodedFileName = encodeURIComponent(outputFileName);

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
            },
        });
    } catch (error: any) {
        console.error("❌ ERROR at conversion:", error);
        console.error("Error stack:", error.stack);

        if (browser) {
            await browser.close();
        }

        return NextResponse.json(
            { error: "Conversion failed", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
