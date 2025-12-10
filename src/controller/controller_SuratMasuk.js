require('dotenv').config()
const service = require('../services/SuratMasuk_services')
const logger = require('../utils/logger')
const xlsx = require('xlsx')
const { v4, validate: isUuid } = require("uuid");
const { requestResponse, uploadToCloudinary } = require('../utils/index');
const moment = require('moment');

let response

const create = async (req, res) => {
    let response;
    try {
        console.log(req.body);

        const {
            tanggal_surat,
            tanggal_terima,
            no_surat,
            pengirim,
            perihal,
            jenis_surat,
            keterangan,
        } = req.body;

        console.log(req.body)

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                ...requestResponse.incomplete_body,
                message: 'File surat (PDF) harus diunggah.',
            });
        }

        if (!tanggal_surat || !tanggal_terima || !no_surat || !pengirim || !perihal || !jenis_surat) {
            return res.status(400).json({
                ...requestResponse.incomplete_body,
                message: 'Data wajib tidak lengkap.',
            });
        }

        // Upload file ke Cloudinary
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        const fileUrl = result.secure_url;

        // Gunakan field kapital sesuai schema
        const newSuratMasuk = {
            IDSURATMASUK: v4(),
            TANGGAL_SURAT: new Date(tanggal_surat),
            TANGGAL_TERIMA: new Date(tanggal_terima),
            NO_SURAT: no_surat,
            PENGIRIM: pengirim,
            PERIHAL: perihal,
            JENIS_SURAT: jenis_surat,
            FILE_PATH: fileUrl,
            KETERANGAN: keterangan || '-',
            DISPOSISI: [],
            CREATED_AT: new Date(),
            UPDATED_AT: new Date(),
        };

        console.log(newSuratMasuk);

        const data = await service.create(newSuratMasuk);
        response = { ...requestResponse.success, data };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
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

// function excelDateToJSDate(serial) {
//     const excelEpoch = new Date(1900, 0, 0); // 1 Januari 1900
//     const jsDate = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms per hari
//     return jsDate;
// }

// function parseDate(dateString) {
//     if (isNaN(dateString)) {
//         return moment(dateString, 'DD/MM/YYYY').format('YYYY-MM-DD');
//     } else {
//         const jsDate = excelDateToJSDate(parseFloat(dateString));
//         return moment(jsDate).format('YYYY-MM-DD');
//     }
// }

const addDisposisi = async (req, res) => {
    try {
        const data = await service.addDisposisi({ IDSURATMASUK: req.params.id }, req.body)
        response = { ...requestResponse.success, data: data };
    } catch (err) {
        logger.error(err)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
};

const deleteDisposisi = async (req, res) => {
    const { idSurat, idPegawai } = req.params;
    console.log(idSurat, idPegawai)
    let response;

    try {
        const result = await service.deleteDisposisi(idSurat, idPegawai);

        if (result.modifiedCount === 0) {
            response = { ...requestResponse.not_found, message: 'Disposisi tidak ditemukan.' };
        } else {
            response = { ...requestResponse.success, message: 'Disposisi berhasil dihapus.' };
        }
    } catch (error) {
        console.error(error);
        response = { ...requestResponse.server_error };
    }

    return res.json(response);
};

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

const tandaiSudahDilihat = async (req, res) => {
    try {
        const { idSurat } = req.params;
        const { idPegawai } = req.body;

        await service.tandaiDisposisiSudahDilihat(idSurat, idPegawai);

        res.json({
            success: true,
            message: "Disposisi ditandai sudah dilihat"
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: false, message: "Gagal update disposisi" });
    }
};

const getByDisposisi = async (req, res) => {
    try {
        console.log(req.params.id)
        const data = await service.getByDisposisi({ IDSURATMASUK: req.params.id })
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
        const data = await service.getById({ IDSURATMASUK: req.params.id })
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const updateOne = async (req, res) => {
    try {
        // console.log("Ini Data Body", req.body)
        const data = await service.updateOne({ IDSURATMASUK: req.params.id }, req.body)
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
        const data = await service.deleteOne({ IDSURATMASUK: req.params.id })
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
    getCount,
    addDisposisi,
    tandaiSudahDilihat,
    getByDisposisi,
    deleteDisposisi
}