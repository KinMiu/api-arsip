const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  console.log("DATA => ", token)

  if (token == null) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      // console.log(err)
      return res.sendStatus(403)
    }
    console.log("Decode => ", decode)
    req.IDUSER = decode.IDUSER
    next()
  })
}

module.exports = {
  verifyToken
}