const mongoose = require('mongoose');
const collectionName = 'jabatan';

const schema = new mongoose.Schema(
    {
        IDJABATAN: {
            type: String,
            required: true,
        },
        NAMA: {
            type: String,
            required: true,
        },
        DESKRIPSI: {
            type: String,
            required: true,
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
