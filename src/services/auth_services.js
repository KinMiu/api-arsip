require('dotenv').config()
const model = require('../model/users')
const { requestResponse } = require('../utils/index')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

let response

const login = async ({ USERNAME, PASSWORD }) => {
	const data = await model.findOne({ USERNAME: USERNAME }, { _id: false }).lean();

	if (data === null) {
		response = { ...requestResponse.unauthorized };
		response.message = 'USER TIDAK TERDAFTAR';
		return response;
	}

	console.log(data)
	const passwordMatch = await bcrypt.compare(PASSWORD, data.PASSWORD);
	if (!passwordMatch) {
		response = { ...requestResponse.unauthorized };
		response.message = 'PASSWORD ANDA SALAH';
		return response;
	}

	const IDUSER = data.IDUSER;
	const NAME = data.NAME;
	const USER_NAME = data.USERNAME;
	const ROLE = data.ROLE;

	const accessToken = jwt.sign(
		{ IDUSER, NAME, USER_NAME, ROLE },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '20s' }
	);

	const refreshToken = jwt.sign(
		{ IDUSER, NAME, USER_NAME, ROLE },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: '1d' }
	);

	await model.updateOne({ IDUSER: IDUSER }, {
		$set: {
			REFRESH_TOKEN: refreshToken
		}
	});

	const result = {
		...requestResponse.success,
		refreshToken,
		accessToken
	};

	return result;
};

const refreshToken = async (token) => {
	const user = await model.findOne({ REFRESH_TOKEN: token }, { _id: false }, { lean: true })
	if (!user) {
		response = { ...requestResponse.not_found }
		response.message = "USER TIDAK DITEMUKAN"
		return response
	}
	jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
		if (err) {
			response = { ...requestResponse.unauthorized }
			return response
		}
		const IDUSER = user.IDUSER
		const NAME = user.NAME
		const USER_NAME = user.USERNAME
		const accessToken = jwt.sign({ IDUSER, NAME, USER_NAME }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '20s'
		})
		response = { ...requestResponse.success, accessToken }
	})
	return response
}

const logout = async (token) => {
	if (!token) {
		response = { ...requestResponse.not_found }
		response.message = "TOKEN TIDAK DITEMUKAN"
		return response
	}
	const data = await model.findOne({ REFRESH_TOKEN: token }, { _id: false }, { lean: true })

	const USERID = data.IDUSER

	return await model.updateOne({ IDUSER: USERID }, {
		$set: {
			REFRESH_TOKEN: ''
		}
	})
}

module.exports = {
	login,
	logout,
	refreshToken
}