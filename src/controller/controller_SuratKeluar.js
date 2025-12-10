require('dotenv').config()
const service = require('../services/SuratKeluar_services')
const logger = require('../utils/logger')
const { v4 } = require("uuid");
const { requestResponse, uploadToCloudinary } = require('../utils/index');

let response;

const create = async (req, res) => {
    try {
        const {
            tanggal_surat,
            tanggal_keluar,
            no_surat,
            tujuan,
            perihal,
            jenis_surat,
            keterangan,
        } = req.body;

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                ...requestResponse.incomplete_body,
                message: 'File surat (PDF) harus diunggah.',
            });
        }

        if (!tanggal_surat || !tanggal_keluar || !no_surat || !tujuan || !perihal || !jenis_surat) {
            return res.status(400).json({
                ...requestResponse.incomplete_body,
                message: 'Data wajib tidak lengkap.',
            });
        }

        const result = await uploadToCloudinary(file.buffer, file.originalname);
        const fileUrl = result.secure_url;

        const newSuratKeluar = {
            IDSURATKELUAR: v4(),
            TANGGAL_SURAT: new Date(tanggal_surat),
            TANGGAL_KELUAR: new Date(tanggal_keluar),
            NO_SURAT: no_surat,
            TUJUAN: tujuan,
            PERIHAL: perihal,
            JENIS_SURAT: jenis_surat,
            FILE_PATH: fileUrl,
            KETERANGAN: keterangan || '-',
            CREATED_AT: new Date(),
            UPDATED_AT: new Date(),
        };

        const data = await service.create(newSuratKeluar);
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }

    res.json(response);
};

const getAll = async (req, res) => {
    try {
        const data = await service.getAll();
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

const getById = async (req, res) => {
    try {
        const data = await service.getById({ IDSURATKELUAR: req.params.id });
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

const updateOne = async (req, res) => {
    try {
        const data = await service.updateOne({ IDSURATKELUAR: req.params.id }, req.body);
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

const deleteOne = async (req, res) => {
    try {
        const data = await service.deleteOne({ IDSURATKELUAR: req.params.id });
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

const deleteAll = async (req, res) => {
    try {
        const data = await service.deleteAll();
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

const getCount = async (req, res) => {
    try {
        const data = await service.getCount();
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
};

module.exports = {
    create,
    getAll,
    getById,
    updateOne,
    deleteOne,
    deleteAll,
    getCount
};
