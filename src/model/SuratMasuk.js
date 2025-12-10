const mongoose = require('mongoose');
const collectionName = 'suratMasuk';

// Subschema untuk DISPOSISI
const disposisiSchema = new mongoose.Schema(
    {
        PEGAWAI: {
            type: String,
            required: true,
        },
        SUDAH_DILIHAT: {
            type: Boolean,
            default: false,
        },
        CATATAN: {
            type: String,
            default: '-',
        },
        TANGGAL_DISPOSISI: {
            type: Date,
            default: () => new Date(),
        },
    },
    { _id: false }
);

// Main Schema SURAT MASUK
const schema = new mongoose.Schema(
    {
        IDSURATMASUK: {
            type: String,
            required: true,
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
            default: '-',
        },
        DISPOSISI: {
            type: [disposisiSchema],
            default: [],
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
