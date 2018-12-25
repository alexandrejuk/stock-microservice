const Axios = require('axios').default
const {
    CONNECTA_HOST,
    CONNECTA_PORT,
    CONNECTA_API_KEY,
} = process.env

const baseURL = `http://${CONNECTA_HOST}:${CONNECTA_PORT}/api`
const client_endpoint = '/clientes'

const connectaApi = Axios.create({
  baseURL,
  headers: {
    apikey: CONNECTA_API_KEY,
  }
})

const getCustomerByDocumentId = async (document_id) => {
  const response = await connectaApi.get(`${client_endpoint}/${document_id}`)

  return response.data
}


module.exports = {
    getCustomerByDocumentId,
}