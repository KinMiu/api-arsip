const model = require("../model/SuratKeluar");
const {requestResponse} = require("../utils");

const bulanRomawi = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

const create = async (data) => {
  const Upload = await model.create(data);
  return {...requestResponse.success, data: Upload};
};

const createGenerate = async (data) => {
  return await model.create(data);
};

const getAll = async () => {
  return await model.find().sort({CREATED_AT: -1});
};

const getById = async (condition) => {
  return await model.findOne(condition);
};

const updateOne = async (condition, body) => {
  body.UPDATED_AT = new Date();
  return await model.updateOne(condition, body);
};

const finalFile = async (fileUrl, idSurat) => {
  return await model.updateOne(
    {IDSURATKELUAR: idSurat},
    {
      $set: {
        FILE_PATH: fileUrl,
        STATUS: "FINAL",
      },
    }
  );
};

const deleteOne = async (condition) => {
  return await model.deleteOne(condition);
};

const generateNomorSurat = async (tanggalSurat) => {
  const year = new Date(tanggalSurat).getFullYear();

  const count = await model.countDocuments({
    TANGGAL_SURAT: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  });

  const nomorUrut = String(count + 1).padStart(3, "0");
  const bulan = bulanRomawi[new Date(tanggalSurat).getMonth()];

  return `${nomorUrut}/BPB/KEMDIKBUD/${bulan}/${year}`;
};

const getWithDraft = async () => {
  return await model
    .find(
      {
        STATUS: "DRAFT",
      },
      {_id: 0}
    )
    .sort({CREATED_AT: -1});
};

const addRevisi = async (idSurat, revisiData) => {
  return await model.updateOne(
    {IDSURATKELUAR: idSurat},
    {
      $push: {
        REVISI: revisiData,
      },
      $set: {
        STATUS: "DRAFT",
        UPDATED_AT: new Date(),
      },
    }
  );
};

const uploadPerbaikan = async (
  idSurat,
  index,
  filePath,
  idPegawai,
  namaPegawai
) => {
  return await model.updateOne(
    {
      IDSURATKELUAR: idSurat,
      [`REVISI.${index}`]: {$exists: true},
    },
    {
      $set: {
        FILE_PATH: filePath,
        [`REVISI.${index}.SUDAH_DIPERBAIKI`]: true,
        [`REVISI.${index}.DIPERBAIKI_AT`]: new Date(),
        [`REVISI.${index}.DIPERBAIKI_OLEH`]: {
          IDPEGAWAI: idPegawai,
          NAMA: namaPegawai,
        },
        UPDATED_AT: new Date(),
      },
    }
  );
};

module.exports = {
  create,
  createGenerate,
  getAll,
  getById,
  updateOne,
  deleteOne,
  generateNomorSurat,
  getWithDraft,
  finalFile,
  addRevisi,
  uploadPerbaikan,
};
