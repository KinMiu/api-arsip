const model = require('../model/Pegawai')
const service = require('../services/users_services')
const { requestResponse, upload } = require('../utils/index')

const create = async (data) => {
    const daftar = await service.create(data)
    if (daftar.status === false) {
        console.log(daftar)
        return daftar
    }

    const Upload = await model.create(data)
    return { ...requestResponse.success, data: Upload }
}

const getAll = async (attributes) => {
    return await model.aggregate([
        {
            $lookup: {
                from: "jabatan",
                localField: "IDJABATAN",
                foreignField: "IDJABATAN",
                as: "JABATAN"
            }
        },
        { $unwind: "$JABATAN" }
    ]);
}

const getById = async (condition) => {
    return model.findOne(condition)
}

const updateOne = async (condition, body) => {
    return model.updateOne(condition, body)
}

const deleteOne = async (condition) => {
    const deletePegawai = await model.deleteOne(condition)
    return { ...deletePegawai }
}

// const deleteAll = async () => {
//     const deleteManySample = await modelSample.deleteMany({})
//     const deletePegawai = await model.deleteMany({})
//     return { ...deletePegawai, deleteManySample }
// }

const getCount = (condition) => {
    return model.countDocuments(condition)
}

module.exports = {
    create,
    getAll,
    updateOne,
    getById,
    deleteOne,
    getCount
}