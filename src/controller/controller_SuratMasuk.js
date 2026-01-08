require("dotenv").config();
const service = require("../services/SuratMasuk_services");
const logger = require("../utils/logger");
const {v4} = require("uuid");
const {requestResponse, uploadToCloudinary} = require("../utils/index");
const generateParafPDF = require("../utils/generateParafPDF");
const pegawaiService = require("../services/Pegawai_services");

let response;

/**
 * ===============================
 * CREATE SURAT MASUK
 * ===============================
 */
const create = async (req, res) => {
  try {
    const {
      tanggal_surat,
      tanggal_terima,
      no_surat,
      pengirim,
      perihal,
      jenis_surat,
      keterangan,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "File surat (PDF) wajib diunggah",
      });
    }

    if (
      !tanggal_surat ||
      !tanggal_terima ||
      !no_surat ||
      !pengirim ||
      !perihal ||
      !jenis_surat
    ) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "Data wajib tidak lengkap",
      });
    }

    // Upload ke Cloudinary
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname
    );

    const payload = {
      IDSURATMASUK: v4(),
      TANGGAL_SURAT: new Date(tanggal_surat),
      TANGGAL_TERIMA: new Date(tanggal_terima),
      NO_SURAT: no_surat,
      PENGIRIM: pengirim,
      PERIHAL: perihal,
      JENIS_SURAT: jenis_surat,
      FILE_PATH: uploadResult.secure_url,
      KETERANGAN: keterangan || "-",
      DISPOSISI: null,
      CREATED_AT: new Date(),
      UPDATED_AT: new Date(),
    };

    console.log(payload);

    const data = await service.create(payload);
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }

  res.json(response);
};

/**
 * ===============================
 * SET DISPOSISI (KE PEMIMPIN)
 * ===============================
 */
const addDisposisi = async (req, res) => {
  try {
    const {pegawai, catatan} = req.body;

    if (!pegawai) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "Pegawai tujuan disposisi wajib diisi",
      });
    }

    const data = await service.addDisposisi(
      {IDSURATMASUK: req.params.id},
      {pegawai, catatan}
    );

    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }

  res.json(response);
};

/**
 * ===============================
 * TANDAI SUDAH DILIHAT (PEMIMPIN)
 * ===============================
 */
const tandaiSudahDilihat = async (req, res) => {
  try {
    const {idSurat} = req.params;
    const {idPegawai} = req.body;

    if (!idPegawai) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "ID Pegawai wajib dikirim",
      });
    }

    await service.tandaiDisposisiSudahDilihat(idSurat, idPegawai);

    res.json({
      ...requestResponse.success,
      message: "Surat telah dibaca oleh pemimpin",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      ...requestResponse.server_error,
      message: "Gagal update status dibaca",
    });
  }
};

/**
 * ===============================
 * PARAF SURAT (PEMIMPIN)
 * ===============================
 */
const parafSurat = async (req, res) => {
  try {
    const {idSurat} = req.params;
    const {idPegawai} = req.body;

    if (!idPegawai) {
      return res.status(400).json({
        ...requestResponse.incomplete_body,
        message: "ID Pegawai wajib dikirim",
      });
    }

    // 1. Ambil surat
    const surat = await service.getById({IDSURATMASUK: idSurat});
    if (!surat) {
      return res.status(404).json({
        ...requestResponse.not_found,
        message: "Surat tidak ditemukan",
      });
    }

    // 2. Validasi pegawai disposisi
    if (surat.DISPOSISI?.PEGAWAI !== idPegawai) {
      return res.status(403).json({
        ...requestResponse.forbidden,
        message: "Anda tidak memiliki hak untuk memparaf surat ini",
      });
    }

    // 3. Wajib sudah dibaca
    if (!surat.DISPOSISI?.SUDAH_DILIHAT) {
      return res.status(400).json({
        ...requestResponse.failed,
        message: "Surat harus dibaca terlebih dahulu sebelum diparaf",
      });
    }

    const pegawai = await pegawaiService.getById({IDPEGAWAI: idPegawai});
    if (!pegawai) {
      return res.status(404).json({
        ...requestResponse.not_found,
        message: "Data pegawai tidak ditemukan",
      });
    }

    const namaPimpinan = pegawai.NAMA;
    const jabatanPimpinan = pegawai.JABATAN?.NAMA || "-";
    // console.log(surat);

    // 4. Generate PDF + Paraf
    const fileParafUrl = await generateParafPDF({
      fileUrl: surat.FILE_PATH,
      nama: namaPimpinan,
      jabatan: jabatanPimpinan,
    });

    // 5. Simpan hasil paraf (SEKALIGUS SETUJUI)
    await service.parafSurat(idSurat, idPegawai, fileParafUrl);

    res.json({
      ...requestResponse.success,
      message: "Surat berhasil disetujui dan diparaf",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...requestResponse.server_error,
      message: "Gagal memparaf surat",
    });
  }
};

/**
 * ===============================
 * GET ALL SURAT MASUK
 * ===============================
 */
const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * ===============================
 * GET SURAT MASUK BY ID
 * ===============================
 */
const getById = async (req, res) => {
  try {
    const data = await service.getById({IDSURATMASUK: req.params.id});
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * ===============================
 * UPDATE SURAT MASUK
 * ===============================
 */
const updateOne = async (req, res) => {
  try {
    const data = await service.updateOne(
      {IDSURATMASUK: req.params.id},
      req.body
    );
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * ===============================
 * DELETE SURAT MASUK
 * ===============================
 */
const deleteOne = async (req, res) => {
  try {
    const data = await service.deleteOne({IDSURATMASUK: req.params.id});
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * ===============================
 * DELETE ALL (DEV ONLY)
 * ===============================
 */
const deleteAll = async (req, res) => {
  try {
    const data = await service.deleteAll();
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * ===============================
 * COUNT
 * ===============================
 */
const getCount = async (req, res) => {
  try {
    const data = await service.getCount();
    response = {...requestResponse.success, data};
  } catch (error) {
    logger.error(error);
    response = {...requestResponse.server_error};
  }
  res.json(response);
};

/**
 * GET SURAT MASUK YANG SUDAH DISPOSISI
 */
const getWithDisposisi = async (req, res) => {
  try {
    const result = await service.getWithDisposisi();
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

module.exports = {
  create,
  addDisposisi,
  tandaiSudahDilihat,
  parafSurat,
  getAll,
  getWithDisposisi,
  getById,
  updateOne,
  deleteOne,
  deleteAll,
  getCount,
};
