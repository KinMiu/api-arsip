const mongoose = require('mongoose');
const collectionName = 'suratKeluar'; // Nama koleksi baru

const schema = new mongoose.Schema(
    {
        IDSURATKELUAR: {
            type: String,
            required: true,
        },
        TANGGAL_KELUAR: {
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
        TUJUAN: {
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
            default: '-',
        },
        CREATED_AT: {
            type: Date,
            default: () => new Date(),
        },
        UPDATED_AT: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        collection: collectionName,
    }
);

module.exports = mongoose.model(collectionName, schema);
