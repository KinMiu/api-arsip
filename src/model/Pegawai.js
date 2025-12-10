const mongoose = require('mongoose');
const collectionName = 'pegawai';

const schema = new mongoose.Schema(
    {
        IDPEGAWAI: {
            type: String,
            required: true,
        },
        NAMA: {
            type: String,
            required: true,
        },
        EMAIL: {
            type: String,
            required: true,
        },
        NO_TELP: {
            type: String,
            required: true,
        },
        IDJABATAN: {
            type: String,
            required: true,
        },
        ALAMAT: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: () => new Date(),
        },
        updatedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        collection: collectionName,
    }
);

module.exports = mongoose.model(collectionName, schema);
