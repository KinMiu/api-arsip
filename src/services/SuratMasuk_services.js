const model = require('../model/SuratMasuk')
const { requestResponse, upload } = require('../utils/index')

const create = async (data) => {

    // console.log(data)
    const Upload = await model.create(data)
    // console.log("ini =>> ", upload)
    return { ...requestResponse.success, data: Upload }
}

const addDisposisi = async (condition, data) => {
    console.log(data)
    return await model.updateOne(
        condition,
        {
            $push: {
                DISPOSISI: {
                    PEGAWAI: data.pegawai,
                    CATATAN: data.catatan || '-',
                    SUDAH_DILIHAT: false,
                    TANGGAL_DISPOSISI: new Date()
                }
            },
            updatedAt: new Date()
        },
        { new: true }
    )
}

const deleteDisposisi = async (idSurat, idPegawai) => {
    return await model.updateOne(
        { IDSURATMASUK: idSurat },
        { $pull: { DISPOSISI: { PEGAWAI: idPegawai } } }
    );
};

const getAll = async () => {
    return await model.aggregate([
        {
            $unwind: {
                path: "$DISPOSISI",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "pegawai",
                localField: "DISPOSISI.PEGAWAI",
                foreignField: "IDPEGAWAI",
                as: "DISPOSISI.PEGAWAI_DETAIL",
            },
        },
        {
            $unwind: {
                path: "$DISPOSISI.PEGAWAI_DETAIL",
                preserveNullAndEmptyArrays: true,
            },
        },
        // 🔍 Tambahkan lookup ke koleksi jenissurat
        {
            $lookup: {
                from: "jenisSurat",              // nama koleksi jenis surat
                localField: "JENIS_SURAT",       // field di surat masuk (bisa ID atau kode)
                foreignField: "IDJENISSURAT",    // field di koleksi jenissurat
                as: "JENIS_SURAT_DETAIL",
            },
        },
        {
            $unwind: {
                path: "$JENIS_SURAT_DETAIL",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$IDSURATMASUK",
                IDSURATMASUK: { $first: "$IDSURATMASUK" },
                TANGGAL_TERIMA: { $first: "$TANGGAL_TERIMA" },
                TANGGAL_SURAT: { $first: "$TANGGAL_SURAT" },
                NO_SURAT: { $first: "$NO_SURAT" },
                PENGIRIM: { $first: "$PENGIRIM" },
                PERIHAL: { $first: "$PERIHAL" },
                JENIS_SURAT: { $first: "$JENIS_SURAT_DETAIL" }, // gunakan hasil lookup
                FILE_PATH: { $first: "$FILE_PATH" },
                KETERANGAN: { $first: "$KETERANGAN" },
                CREATED_AT: { $first: "$CREATED_AT" },
                UPDATED_AT: { $first: "$UPDATED_AT" },
                DISPOSISI: {
                    $push: {
                        PEGAWAI: "$DISPOSISI.PEGAWAI_DETAIL",
                        CATATAN: "$DISPOSISI.CATATAN",
                        SUDAH_DILIHAT: "$DISPOSISI.SUDAH_DILIHAT",
                        TANGGAL_DISPOSISI: "$DISPOSISI.TANGGAL_DISPOSISI",
                    },
                },
            },
        },
        {
            $sort: {
                CREATED_AT: -1 // ⬅ urutkan dari terbaru ke terlama
            }
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
};

const tandaiDisposisiSudahDilihat = async (idSurat, idPegawai) => {
    return await model.updateOne(
        {
            IDSURATMASUK: idSurat,
            "DISPOSISI.PEGAWAI": idPegawai
        },
        {
            $set: { "DISPOSISI.$.SUDAH_DILIHAT": true }
        }
    );
};

const getByDisposisi = async (condition) => {
    return await model.aggregate([
        {
            $unwind: {
                path: "$DISPOSISI",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                "DISPOSISI.PEGAWAI": condition.IDSURATMASUK
            }
        },
        {
            $lookup: {
                from: "pegawai",
                localField: "DISPOSISI.PEGAWAI",
                foreignField: "IDPEGAWAI",
                as: "DISPOSISI.PEGAWAI_DETAIL"
            }
        },
        {
            $unwind: {
                path: "$DISPOSISI.PEGAWAI_DETAIL",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "jenissurat",
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
            $group: {
                _id: "$IDSURATMASUK",
                IDSURATMASUK: { $first: "$IDSURATMASUK" },
                TANGGAL_TERIMA: { $first: "$TANGGAL_TERIMA" },
                TANGGAL_SURAT: { $first: "$TANGGAL_SURAT" },
                NO_SURAT: { $first: "$NO_SURAT" },
                PENGIRIM: { $first: "$PENGIRIM" },
                PERIHAL: { $first: "$PERIHAL" },
                JENIS_SURAT: { $first: "$JENIS_SURAT" },
                JENIS_SURAT_DETAIL: { $first: "$JENIS_SURAT_DETAIL" },
                FILE_PATH: { $first: "$FILE_PATH" },
                KETERANGAN: { $first: "$KETERANGAN" },
                CREATED_AT: { $first: "$CREATED_AT" },
                UPDATED_AT: { $first: "$UPDATED_AT" },
                DISPOSISI: {
                    $push: {
                        PEGAWAI: "$DISPOSISI.PEGAWAI_DETAIL",
                        CATATAN: "$DISPOSISI.CATATAN",
                        SUDAH_DILIHAT: "$DISPOSISI.SUDAH_DILIHAT",
                        TANGGAL_DISPOSISI: "$DISPOSISI.TANGGAL_DISPOSISI"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]);
};

const getById = async (condition) => {
    return model.findOne(condition)
}

const updateOne = async (condition, body) => {
    const findData = await model.findOne(condition)
    const updateData = await model.updateOne(condition, body)
    console.log(findData)
    return updateData
}

const deleteOne = async (condition) => {
    const deleteOne = await model.deleteOne(condition)
    return { ...deleteOne }
}

const deleteAll = async () => {
    const deleteManySample = await modelSample.deleteMany({})
    const deletePegawai = await model.deleteMany({})
    return { ...deletePegawai, deleteManySample }
}

const getCount = (condition) => {
    return model.countDocuments(condition)
}

module.exports = {
    create,
    getAll,
    updateOne,
    getById,
    deleteOne,
    deleteAll,
    getCount,
    tandaiDisposisiSudahDilihat,
    addDisposisi,
    getByDisposisi,
    deleteDisposisi
}