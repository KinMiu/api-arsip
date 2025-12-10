const mongoose = require('mongoose');
const collectionName = 'jenisSurat';

const schema = new mongoose.Schema(
    {
        IDJENISSURAT: {
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
