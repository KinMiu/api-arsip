const axios = require("axios");
const {PDFDocument, rgb, StandardFonts} = require("pdf-lib");
const {uploadToCloudinary} = require("./index");

/**
 * GENERATE PDF PARAF
 * @param {string} pdfUrl - URL PDF lama (Cloudinary)
 * @param {string} namaPegawai - Nama / ID pemaraf
 * @returns {string} secure_url cloudinary
 */
const generateParafPDF = async (data) => {
  console.log(data);
  // 1. Download PDF lama
  const pdfBytes = await axios.get(data.fileUrl, {
    responseType: "arraybuffer",
  });

  // 2. Load PDF
  const pdfDoc = await PDFDocument.load(pdfBytes.data);

  // 3. Ambil halaman terakhir
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  // 4. Font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 5. Posisi paraf
  const {width} = lastPage.getSize();

  const x = width - 200;
  const y = 60;

  // 6. Tambah teks paraf
  lastPage.drawText("DISPOSISI PIMPINAN", {
    x,
    y: y + 60,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  lastPage.drawText(`Nama : ${data.nama}`, {
    x,
    y: y + 40,
    size: 10,
    font,
  });

  lastPage.drawText(`Jabatan : ${data.jabatan}`, {
    x,
    y: y + 20,
    size: 10,
    font,
  });

  lastPage.drawText(`Tanggal : ${new Date().toLocaleDateString("id-ID")}`, {
    x,
    y,
    size: 10,
    font,
  });

  // 7. Simpan PDF baru
  const newPdfBytes = await pdfDoc.save();

  // 8. Upload ke Cloudinary
  const uploadResult = await uploadToCloudinary(
    Buffer.from(newPdfBytes),
    `paraf-${Date.now()}.pdf`
  );

  return uploadResult.secure_url;
};

module.exports = generateParafPDF;
