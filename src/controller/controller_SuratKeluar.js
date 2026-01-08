const {v4} = require("uuid");
const service = require("../services/SuratKeluar_services");
const generatePDF = require("../utils/generateSuratKeluarPDF");
const {uploadToCloudinary, requestResponse} = require("../utils");

const create = async (req, res) => {
  try {
    const {
      tanggal_surat,
      tanggal_keluar,
      no_surat,
      tujuan,
      perihal,
      status,
      jenis_surat,
      keterangan,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "File surat (PDF) harus diunggah.",
      });
    }

    if (
      !tanggal_surat ||
      !tanggal_keluar ||
      !no_surat ||
      !tujuan ||
      !perihal ||
      !status ||
      !jenis_surat
    ) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "Data wajib tidak lengkap.",
      });
    }

    const result = await uploadToCloudinary(file.buffer, file.originalname);
    const fileUrl = result.secure_url;

    const newSuratKeluar = {
      IDSURATKELUAR: v4(),
      TANGGAL_SURAT: new Date(tanggal_surat),
      TANGGAL_KELUAR: new Date(tanggal_keluar),
      NO_SURAT: no_surat,
      TUJUAN: tujuan,
      PERIHAL: perihal,
      JENIS_SURAT: jenis_surat,
      STATUS: status,
      FILE_PATH: fileUrl,
      KETERANGAN: keterangan || "-",
      CREATED_AT: new Date(),
      UPDATED_AT: new Date(),
    };

    console.log(newSuratKeluar);

    const data = await service.create(newSuratKeluar);
    response = {...data};
  } catch (error) {
    console.log(error);
    response = {...requestResponse.server_error};
  }

  res.json(response);
};

/* ================= PREVIEW ================= */
const preview = async (req, res) => {
  try {
    const nomorSurat = await service.generateNomorSurat(req.body.tanggal_surat);

    const pdfBytes = await generatePDF({
      ...req.body,
      NO_SURAT: nomorSurat,
    });

    const buffer = Buffer.from(pdfBytes);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=preview-surat-keluar.pdf"
    );
    res.setHeader("Content-Length", buffer.length);

    // ⬇️ custom status biar FE tau ini sukses
    res.setHeader("X-Preview-Status", "SUCCESS");

    return res.status(200).end(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Gagal preview surat",
    });
  }
};

/* ================= SIMPAN ================= */
const generate = async (req, res) => {
  try {
    const nomorSurat = await service.generateNomorSurat(req.body.tanggal_surat);

    const pdfBytes = await generatePDF({
      ...req.body,
      NO_SURAT: nomorSurat,
    });

    const upload = await uploadToCloudinary(
      Buffer.from(pdfBytes),
      `surat-keluar-${Date.now()}.pdf`
    );

    const data = await service.createGenerate({
      IDSURATKELUAR: v4(),
      TANGGAL_SURAT: new Date(req.body.tanggal_surat),
      TANGGAL_KELUAR: new Date(),
      NO_SURAT: nomorSurat,
      TUJUAN: req.body.tujuan,
      PERIHAL: req.body.perihal,
      JENIS_SURAT: req.body.jenis_surat,
      FILE_PATH: upload.secure_url,
      STATUS: "DRAFT",
      KETERANGAN: req.body.keterangan || "-",
      CREATED_AT: new Date(),
      UPDATED_AT: new Date(),
    });

    res.json({
      success: true,
      message: "Surat keluar berhasil dibuat",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal generate surat keluar",
    });
  }
};

const acc = async (req, res) => {
  try {
    const {id} = req.params;
    const {idPegawai} = req.body;

    const file = req.file;

    console.log(file);
    if (!idPegawai) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "ID Pegawai wajib dikirim",
      });
    }

    // 1. Ambil surat
    const surat = await service.getById({IDSURATKELUAR: id});
    if (!surat) {
      return res.status(404).json({
        ...requestResponse.not_found,
        message: "Surat tidak ditemukan",
      });
    }
    console.log("tes");

    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname
    );

    await service.finalFile(uploadResult.secure_url, id);

    res.json({
      ...requestResponse.success,
      message: "Surat berhasil disetujui",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...requestResponse.server_error,
      message: "Gagal memparaf surat",
    });
  }
};

/* ================= CRUD ================= */
const getAll = async (req, res) => {
  res.json(await service.getAll());
};

const getById = async (req, res) => {
  res.json(await service.getById({IDSURATKELUAR: req.params.id}));
};

const updateOne = async (req, res) => {
  res.json(await service.updateOne({IDSURATKELUAR: req.params.id}, req.body));
};

const deleteOne = async (req, res) => {
  res.json(await service.deleteOne({IDSURATKELUAR: req.params.id}));
};

const getWithDraft = async (req, res) => {
  try {
    const result = await service.getWithDraft();
    return res.json({
      success: true,
      message: "Data surat dengan disposisi",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data surat disposisi",
    });
  }
};

const addRevisi = async (req, res) => {
  try {
    const {id} = req.params;
    const {catatan, oleh} = req.body;
    const file = req.file;

    if (!catatan) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "Catatan revisi wajib diisi",
      });
    }

    // cek surat
    const surat = await service.getById({IDSURATKELUAR: id});
    if (!surat) {
      return res.status(404).json({
        ...requestResponse.not_found,
        message: "Surat tidak ditemukan",
      });
    }

    let filePath = null;

    // upload file revisi jika ada
    if (file) {
      const uploadResult = await uploadToCloudinary(
        file.buffer,
        `revisi-${Date.now()}-${file.originalname}`
      );
      filePath = uploadResult.secure_url;
    }

    const revisiData = {
      CATATAN: catatan,
      OLEH: oleh || "SYSTEM",
      FILE_PATH: filePath,
      CREATED_AT: new Date(),
    };

    await service.addRevisi(id, revisiData);

    res.json({
      ...requestResponse.success,
      message: "Revisi berhasil ditambahkan",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...requestResponse.server_error,
      message: "Gagal menambahkan revisi",
    });
  }
};

const uploadPerbaikan = async (req, res) => {
  try {
    const {id, index} = req.params;
    const {idPegawai, namaPegawai} = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File perbaikan wajib diupload",
      });
    }

    if (!idPegawai || !namaPegawai) {
      return res.status(400).json({
        success: false,
        message: "Identitas pegawai wajib dikirim",
      });
    }

    // cek surat
    const surat = await service.getById({IDSURATKELUAR: id});
    if (!surat) {
      return res.status(404).json({
        success: false,
        message: "Surat tidak ditemukan",
      });
    }

    if (!surat.REVISI || !surat.REVISI[index]) {
      return res.status(400).json({
        success: false,
        message: "Data revisi tidak valid",
      });
    }

    // upload file baru
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      `perbaikan-${Date.now()}-${file.originalname}`
    );

    await service.uploadPerbaikan(
      id,
      index,
      uploadResult.secure_url,
      idPegawai,
      namaPegawai
    );

    return res.json({
      success: true,
      message: "Perbaikan berhasil diupload, menunggu persetujuan pimpinan",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal upload perbaikan",
    });
  }
};

module.exports = {
  create,
  preview,
  generate,
  getAll,
  getById,
  updateOne,
  deleteOne,
  getWithDraft,
  acc,
  addRevisi,
  uploadPerbaikan,
};
