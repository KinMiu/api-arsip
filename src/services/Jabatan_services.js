const model = require('../model/Jabatan')
const { requestResponse, upload } = require('../utils/index')

const create = async (data) => {
    const Upload = await model.create(data)
    return { ...requestResponse.success, data: Upload }
}

const getAll = async (attributes) => {
    return await model.find({}, attributes, { _id: false }, { lean: false },)
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