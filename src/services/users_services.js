const model = require('../model/users')
const bcrypt = require('bcrypt')
const { requestResponse } = require('../utils/index')

let response

const create = async (data) => {
    const checkData = await model.findOne({ USERNAME: data.NO_TELP }, { _id: false }, { lean: true })
    if (checkData !== null) {
        response = { ...requestResponse.unprocessable_entity }
        response.message = 'NOMOR TELPON TELAH TERDAFTAR'
        return response
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);

    const dataUser = {
        IDUSER: data.IDPEGAWAI,
        NAME: data.NAMA,
        USERNAME: data.NO_TELP,
        ALAMAT: data.ALAMAT,
        NO_TELP: data.NO_TELP,
        PASSWORD: hashedPassword,
        ROLE: '2',
    }

    await model.create(dataUser)
    return { ...requestResponse.success, data: model }
}

const getAll = async (attributes) => {
    return await model.find({}, attributes, { _id: false }, { lean: false },)
}

const getById = async (attributes, condition) => {
    return model.findOne(condition)
}

const updateOne = async (condition, body) => {
    return model.updateOne(condition, body)
}

const deleteOne = (condition) => {
    return model.deleteOne(condition)
}

const getCount = (condition) => {
    return model.countDocuments(condition)
}

const changeName = async (IDUSER, newName) => {
    return model.updateOne(
        { IDUSER },
        { $set: { NAME: newName, UPDATED_AT: new Date() } }
    );
}

const changePassword = async (IDUSER, oldPassword, newPassword) => {
    const user = await model.findOne({ IDUSER });

    if (!user) {
        return { error: 'USER_NOT_FOUND' };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.PASSWORD);

    if (!isMatch) {
        return { error: 'INVALID_OLD_PASSWORD' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return model.updateOne(
        { IDUSER },
        { $set: { PASSWORD: hashedPassword, UPDATED_AT: new Date() } }
    );
}

module.exports = {
    create,
    getAll,
    updateOne,
    getById,
    deleteOne,
    getCount,
    changeName,
    changePassword
}