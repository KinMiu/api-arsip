require('dotenv').config()
const service = require('../services/users_services')
const logger = require('../utils/logger')
const { requestResponse } = require('../utils/index')
const { v4, validate: isUuid } = require("uuid");

let response

const create = async (req, res) => {
    try {
        req.body.IDUSER = v4();
        const data = await service.create(req.body)
        response = { ...data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const getAll = async (req, res) => {
    try {
        const attributes = {
            IDUSER: 1,
            NAME: 1,
            EMAIL: 1,
            ALAMAT: 1,
            NO_TELP: 1,
            ROLE: 1,
        }
        const data = await service.getAll(attributes)
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const getById = async (req, res) => {
    try {
        const attributes = {
            IDUSER: 1,
            NAME: 1,
            EMAIL: 1,
            ROLE: 1,
        }
        const data = await service.getById(attributes, { IDUSER: req.params.id })
        console.log(data)
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const updateOne = async (req, res) => {
    try {
        const data = await service.updateOne({ IDUSER: req.params.id }, req.body)
        response = { ...requestResponse.success, data }
    } catch (error) {
        logger.error(error)
        response = { ...requestResponse.server_error }
    }
    res.json(response)
}

const deleteOne = async (req, res) => {
    try {
        const data = await service.deleteOne({ IDUSER: req.params.id })
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

const changeName = async (req, res) => {
    try {
        const { newName } = req.body;
        const IDUSER = req.params.id;

        if (!newName) {
            return res.json({ ...requestResponse.bad_request, message: 'New name is required' });
        }

        await service.changeName(IDUSER, newName);

        response = { ...requestResponse.success, message: 'Name updated successfully' };
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const IDUSER = req.params.id;

        if (!oldPassword || !newPassword) {
            return res.json({ ...requestResponse.bad_request, message: 'Old and new password are required' });
        }

        const result = await service.changePassword(IDUSER, oldPassword, newPassword);

        if (result?.error === 'USER_NOT_FOUND') {
            response = { ...requestResponse.not_found, message: 'User not found' };
        } else if (result?.error === 'INVALID_OLD_PASSWORD') {
            response = { ...requestResponse.unauthorized, message: 'Old password is incorrect' };
        } else {
            response = { ...requestResponse.success, message: 'Password updated successfully' };
        }
    } catch (error) {
        logger.error(error);
        response = { ...requestResponse.server_error };
    }
    res.json(response);
}

module.exports = {
    create,
    getAll,
    getById,
    updateOne,
    deleteOne,
    changeName,
    changePassword,
    getCount
}