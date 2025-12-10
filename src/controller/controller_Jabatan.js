require('dotenv').config()
const service = require('../services/Jabatan_services')
const logger = require('../utils/logger')
const xlsx = require('xlsx')
const { v4, validate: isUuid } = require("uuid");
const { requestResponse } = require('../utils/index');
const moment = require('moment');

let response

const create = async (req, res) => {
    try {
        req.body.IDJABATAN = v4()
        const data = await service.create(req.body);
        res.json(data);
    } catch (error) {
        logger.error(error);
        res.json({ ...requestResponse.server_error });
    }
};

// const createExcel = async (req, res) => {
//     try {
//         const file = req.file

//         if (!file) {
//             return res.status(400).send("Masukkan File")
//         }

//         const workbook = xlsx.read(file.buffer, { type: 'buffer' })
//         const sheetName = workbook.SheetNames[0]
//         const sheet = workbook.Sheets[sheetName]

//         const dataJson = xlsx.utils.sheet_to_json(sheet)

//         const processedData = dataJson.map(row => {
//             const newRow = {
//                 NAME: row.NAME,
//                 SUBAREA: row.SUBAREA,
//                 POSITION: row.POSITION,
//                 EMPLOYEE: row.EMPLOYEE,
//                 PAYSCALE: row.PAYSCALE,
//                 TMK: parseDate(row.TMK),
//                 MASAKERJA: row.MASAKERJA,
//                 USIA: row.USIA,
//                 RELIGION: row.RELIGION,
//                 EDUCATION: row.EDUCATION,
//             };


//             return newRow;
//         });

//         for (let i = 0; i < processedData.length; i++) {
//             console.log(processedData[i])
//             const data = await service.create(processedData[i])
//             response = { ...data }
//         }
//     } catch (error) {
//         logger.error(error)
//         response = { ...requestResponse.server_error }
//     }
//     res.json(response)
// }

function excelDateToJSDate(serial) {
    const excelEpoch = new Date(1900, 0, 0); // 1 Januari 1900
    const jsDate = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms per hari
    return jsDate;
}

function parseDate(dateString) {
    if (isNaN(dateString)) {
        return moment(dateString, 'DD/MM/YYYY').format('YYYY-MM-DD');
    } else {
        const jsDate = excelDateToJSDate(parseFloat(dateString));
        return moment(jsDate).format('YYYY-MM-DD');
    }
}

const getAll = async (req, res) => {
    try {
        const data = await service.getAll()
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const getById = async (req, res) => {
    try {
        console.log(req.params.id)
        const data = await service.getById({ IDJABATAN: req.params.id })
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const updateOne = async (req, res) => {
    try {
        const data = await service.updateOne({ IDJABATAN: req.params.id }, req.body)
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const deleteOne = async (req, res) => {
    try {
        console.log(req.params.id)
        const data = await service.deleteOne({ IDJABATAN: req.params.id })
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const deleteAll = async (req, res) => {
    try {
        const data = await service.deleteAll()
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const getCount = async (req, res) => {
    try {
        const data = await service.getCount()
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

module.exports = {
    create,
    getAll,
    getById,
    updateOne,
    deleteOne,
    deleteAll,
    getCount
}