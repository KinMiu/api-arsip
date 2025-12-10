const model = require('../model/SuratKeluar');
const { requestResponse } = require('../utils/index');

const create = async (data) => {
    const Upload = await model.create(data);
    return { ...requestResponse.success, data: Upload };
};

const getAll = async () => {
    return await model.aggregate([
        {
            $lookup: {
                from: "jenisSurat",
                localField: "JENIS_SURAT",
                foreignField: "IDJENISSURAT",
                as: "JENIS_SURAT_DETAIL"
            }
        },
        {
            $unwind: {
                path: "$JENIS_SURAT_DETAIL",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: {
                CREATED_AT: -1 // ⬅ urutkan dari terbaru ke terlama
            }
        },
        {
            $project: {
                _id: 0,
                IDSURATKELUAR: 1,
                TANGGAL_KELUAR: 1,
                TANGGAL_SURAT: 1,
                NO_SURAT: 1,
                TUJUAN: 1,
                PERIHAL: 1,
                JENIS_SURAT: "$JENIS_SURAT_DETAIL",
                FILE_PATH: 1,
                KETERANGAN: 1,
                CREATED_AT: 1,
                UPDATED_AT: 1
            }
        }
    ]);
};

const getById = async (condition) => {
    return model.findOne(condition);
};

const updateOne = async (condition, body) => {
    console.log(body)
    return model.updateOne(condition, body);
};

const deleteOne = async (condition) => {
    const deleted = await model.deleteOne(condition);
    return { ...deleted };
};

const deleteAll = async () => {
    const deleted = await model.deleteMany({});
    return { ...deleted };
};

const getCount = (condition) => {
    return model.countDocuments(condition);
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
