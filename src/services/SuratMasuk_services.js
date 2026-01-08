const model = require("../model/SuratMasuk");
const {requestResponse} = require("../utils/index");

/**
 * CREATE SURAT MASUK
 */
const create = async (data) => {
  const result = await model.create(data);
  return {...requestResponse.success, data: result};
};

/**
 * SET DISPOSISI (1 PEMIMPIN SAJA)
 */
const addDisposisi = async (condition, data) => {
  return await model.updateOne(condition, {
    $set: {
      DISPOSISI: {
        PEGAWAI: data.pegawai, // IDPEGAWAI pemimpin
        CATATAN: data.catatan || "-",
        SUDAH_DILIHAT: false,
        SUDAH_DISETUJUI: false,
      },
      UPDATED_AT: new Date(),
    },
  });
};

/**
 * TANDAI DISPOSISI SUDAH DILIHAT
 */
const tandaiDisposisiSudahDilihat = async (idSurat, idPegawai) => {
  return await model.updateOne(
    {
      IDSURATMASUK: idSurat,
      "DISPOSISI.PEGAWAI": idPegawai,
    },
    {
      $set: {
        "DISPOSISI.SUDAH_DILIHAT": true,
        "DISPOSISI.TANGGAL_DILIHAT": new Date(),
        UPDATED_AT: new Date(),
      },
    }
  );
};

/**
 * PARAF SURAT (PEMIMPIN)
 */
const parafSurat = async (idSurat, idPegawai, fileParafUrl) => {
  return await model.updateOne(
    {
      IDSURATMASUK: idSurat,
      "DISPOSISI.PEGAWAI": idPegawai,
      "DISPOSISI.SUDAH_DILIHAT": true, // wajib sudah baca
    },
    {
      $set: {
        FILE_PATH: fileParafUrl, // overwrite PDF
        "DISPOSISI.SUDAH_DISETUJUI": true,
        "DISPOSISI.TANGGAL_DISETUJUI": new Date(),
        UPDATED_AT: new Date(),
      },
    }
  );
};

/**
 * AMBIL SEMUA SURAT MASUK
 */
const getAll = async () => {
  return await model.find({}, {_id: 0}).sort({CREATED_AT: -1});
};

/**
 * AMBIL SURAT MASUK BY ID
 */
const getById = async (condition) => {
  return await model.findOne(condition, {_id: 0});
};

/**
 * UPDATE SURAT MASUK
 */
const updateOne = async (condition, body) => {
  body.UPDATED_AT = new Date();
  return await model.updateOne(condition, body);
};

/**
 * DELETE SURAT MASUK
 */
const deleteOne = async (condition) => {
  return await model.deleteOne(condition);
};

/**
 * DELETE SEMUA DATA (DEV ONLY)
 */
const deleteAll = async () => {
  return await model.deleteMany({});
};

/**
 * HITUNG DATA
 */
const getCount = (condition = {}) => {
  return model.countDocuments(condition);
};

/**
 * AMBIL SURAT MASUK YANG SUDAH ADA DISPOSISI
 */
const getWithDisposisi = async () => {
  return await model
    .find(
      {
        DISPOSISI: {$exists: true},
        "DISPOSISI.PEGAWAI": {$ne: null},
      },
      {_id: 0}
    )
    .sort({CREATED_AT: -1});
};

module.exports = {
  create,
  addDisposisi,
  parafSurat,
  tandaiDisposisiSudahDilihat,
  getAll,
  getWithDisposisi,
  getById,
  updateOne,
  deleteOne,
  deleteAll,
  getCount,
};
