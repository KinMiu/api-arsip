const mongoose = require("mongoose");

const RevisiSchema = new mongoose.Schema(
  {
    CATATAN: {
      type: String,
      required: true,
    },

    OLEH: {
      IDPEGAWAI: String,
      NAMA: String,
    },

    // 🔽 STATUS PERBAIKAN
    SUDAH_DIPERBAIKI: {
      type: Boolean,
      default: false,
    },

    DIPERBAIKI_OLEH: {
      IDPEGAWAI: String,
      NAMA: String,
    },

    DIPERBAIKI_AT: Date,

    CREATED_AT: {
      type: Date,
      default: Date.now,
    },
  },
  {_id: false}
);

const schema = new mongoose.Schema(
  {
    IDSURATKELUAR: String,
    TANGGAL_SURAT: Date,
    TANGGAL_KELUAR: Date,
    NO_SURAT: String,
    TUJUAN: String,
    PERIHAL: String,
    ISI_SURAT: String,
    JENIS_SURAT: String,

    // 🔥 FILE UTAMA (AKAN DIGANTI SAAT REVISI)
    FILE_PATH: String,

    REVISI: {
      type: [RevisiSchema],
      default: [],
    },

    STATUS: {
      type: String,
      enum: ["DRAFT", "FINAL"],
      default: "FINAL",
    },

    CREATED_AT: Date,
    UPDATED_AT: Date,
  },
  {
    collection: "suratKeluar",
  }
);

module.exports = mongoose.model("suratKeluar", schema);
