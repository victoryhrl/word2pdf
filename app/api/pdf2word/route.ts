import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
    try {
        console.log("PDF2Word Step 1: Received request");
        const formData = await req.formData();
        const file = formData.get("file") as File;

        console.log("PDF2Word Step 2: Got file:", file?.name, file?.size);

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log("PDF2Word Step 3: Converting to buffer");
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log("PDF2Word Step 4: Extracting text from PDF");
        const result = await extractText(uint8Array);
        // unpdf returns text as array of strings per page
        const extractedText = Array.isArray(result.text)
            ? result.text.join('\n\n')
            : String(result.text || '');
        console.log("PDF2Word Step 5: Text extracted, length:", extractedText.length);

        // Split text into paragraphs
        const paragraphs = extractedText
            .split(/\n\n+/)
            .filter((p: string) => p.trim())
            .map(
                (paragraphText: string) =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: paragraphText.trim(),
                                size: 24, // 12pt
                            }),
                        ],
                        spacing: { after: 200 },
                    })
            );

        console.log("PDF2Word Step 6: Creating Word document with", paragraphs.length, "paragraphs");

        // Create Word document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: paragraphs,
                },
            ],
        });

        console.log("PDF2Word Step 7: Generating DOCX buffer");
        const docxBuffer = await Packer.toBuffer(doc);
        console.log("PDF2Word Step 8: DOCX generated, size:", docxBuffer.length);

        const outputFileName = file.name.replace(/\.pdf$/i, "") + ".docx";
        const encodedFileName = encodeURIComponent(outputFileName);

        return new NextResponse(Buffer.from(docxBuffer), {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
            },
        });
    } catch (error: any) {
        console.error("❌ PDF2Word ERROR:", error);
        return NextResponse.json(
            { error: "Conversion failed", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
