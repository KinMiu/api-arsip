const fs = require("fs");
const path = require("path");
const {PDFDocument, StandardFonts} = require("pdf-lib");

module.exports = async function generateSuratKeluarPDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const {width, height} = page.getSize();

  /* ================= FONT ================= */
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontSize = 12;
  const lineHeight = 16;

  /* ================= COP ================= */
  const copPath = path.join(__dirname, "../templates/BAPPEDA.png");
  const copImage = await pdfDoc.embedPng(fs.readFileSync(copPath));

  const copWidth = 500;
  const copHeight = (copImage.height / copImage.width) * copWidth;

  page.drawImage(copImage, {
    x: (width - copWidth) / 2,
    y: height - copHeight - 30,
    width: copWidth,
    height: copHeight,
  });

  page.drawLine({
    start: {x: 50, y: height - copHeight - 40},
    end: {x: width - 50, y: height - copHeight - 40},
    thickness: 1.5,
  });

  /* ================= POSISI ================= */
  let y = height - copHeight - 80;
  const marginX = 70;
  const maxWidth = 460;

  const draw = (text, bold = false, x = marginX) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: bold ? fontBold : fontRegular,
    });
    y -= lineHeight;
  };

  draw(`Nomor : ${data.NO_SURAT}`);
  draw(`Perihal : ${data.perihal}`);
  y -= 20;

  draw(`Yth. ${data.tujuan}`, true);
  y -= 10;

  /* ================= JUSTIFY ENGINE ================= */
  const drawJustifiedParagraph = (text) => {
    const words = text.replace(/\r/g, "").replace(/\n+/g, " \n ").split(" ");

    let line = [];
    let lineWidth = 0;

    const flushLine = (justify) => {
      if (!line.length) return;

      if (!justify || line.length === 1) {
        page.drawText(line.join(" "), {
          x: marginX,
          y,
          size: fontSize,
          font: fontRegular,
        });
      } else {
        const textWidth = line.reduce(
          (w, word) => w + fontRegular.widthOfTextAtSize(word, fontSize),
          0
        );

        const spaceCount = line.length - 1;
        const extraSpace = (maxWidth - textWidth) / spaceCount;

        let x = marginX;
        line.forEach((word, i) => {
          page.drawText(word, {x, y, size: fontSize, font: fontRegular});
          x += fontRegular.widthOfTextAtSize(word, fontSize) + extraSpace;
        });
      }

      y -= lineHeight;
      line = [];
      lineWidth = 0;
    };

    for (const word of words) {
      if (word === "\n") {
        flushLine(false);
        y -= 8;
        continue;
      }

      const wordWidth = fontRegular.widthOfTextAtSize(word, fontSize);
      const spaceWidth = fontRegular.widthOfTextAtSize(" ", fontSize);

      if (lineWidth + wordWidth + spaceWidth > maxWidth) {
        flushLine(true);
      }

      line.push(word);
      lineWidth += wordWidth + spaceWidth;
    }

    flushLine(false);
    y -= 10;
  };

  drawJustifiedParagraph(data.isi_surat);

  /* ================= TTD ================= */
  y -= 20;
  draw(
    `Pekalongan, ${new Date(data.tanggal_surat).toLocaleDateString("id-ID")}`,
    false,
    330
  );
  draw("Kepala BAPPEDA Kota Pekalongan", true, 330);
  y -= 60;
  draw("Nama Pimpinan", true, 330);
  draw("NIP. 19xxxxxxxx", false, 330);

  return await pdfDoc.save();
};
