const mongoose = require("mongoose");
const collectionName = "suratMasuk";

const schema = new mongoose.Schema(
  {
    IDSURATMASUK: {
      type: String,
      required: true,
      unique: true,
    },
    TANGGAL_TERIMA: {
      type: Date,
      required: true,
    },
    TANGGAL_SURAT: {
      type: Date,
      required: true,
    },
    NO_SURAT: {
      type: String,
      required: true,
    },
    PENGIRIM: {
      type: String,
      required: true,
    },
    PERIHAL: {
      type: String,
      required: true,
    },
    JENIS_SURAT: {
      type: String,
      required: true,
    },
    FILE_PATH: {
      type: String,
      required: true,
    },
    KETERANGAN: {
      type: String,
      default: "-",
    },

    // ✅ DISPOSISI TUNGGAL (bukan array)
    DISPOSISI: {
      PEGAWAI: {
        type: String, // IDPEGAWAI pemimpin
      },
      SUDAH_DILIHAT: {
        type: Boolean,
      },
      SUDAH_DISETUJUI: {
        type: Boolean,
      },
      CATATAN: {
        type: String,
      },
      TANGGAL_DILIHAT: {
        type: Date,
      },
      TANGGAL_DISETUJUI: {
        type: Date,
      },
    },

    CREATED_AT: {
      type: Date,
      default: Date.now,
    },
    UPDATED_AT: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: collectionName,
    timestamps: false,
  }
);

module.exports = mongoose.model(collectionName, schema);
