const connectaService = require('../../services/connecta')

const get = async (req, res, next) => {
  try {
    const response = await connectaService.getListCallsByDocumentId(req.params.documentId)
    res.send(response)
  } catch (error) {
    next(error)
  }
}



module.exports = {
  get,
}