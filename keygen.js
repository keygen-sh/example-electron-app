const { ipcRenderer } = require("electron")
const Store = require("electron-store")
const fetch = require("node-fetch")

const store = new Store()
module.exports.store = store

// Account and product IDs. You can get this information by logging into your
// dashboard: https://app.keygen.sh
const KEYGEN_ACCOUNT_ID = "1fddcec8-8dd3-4d8d-9b16-215cac0f9b52"
const KEYGEN_PRODUCT_ID = "5499e2ec-47e6-44cb-91e9-b5d5d65c5590"

module.exports.accountId = KEYGEN_ACCOUNT_ID
module.exports.productId = KEYGEN_PRODUCT_ID

// Base vars for requests
const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`
const KEYGEN_REQUEST_HEADERS = {
  "Accept": "application/vnd.api+json"
}

// Policies representing our product's features. You can get this information
// from your dashboard: https://app.keygen.sh
const KEYGEN_FEATURE_1 = "aac4905c-84d0-41a3-af6e-1026e28c04d3"
const KEYGEN_FEATURE_2 = "dd025847-42fb-49b0-b898-80c34d7734b4"
const KEYGEN_FEATURE_3 = "b6a5ae11-ec60-4ecd-9902-ae48a1077623"

module.exports.appFeatures = {
  KEYGEN_FEATURE_1,
  KEYGEN_FEATURE_2,
  KEYGEN_FEATURE_3
}

// Get an existing session (if one exists and has not expired)
function getSession() {
  let session = store.get("session")

  if (session != null) {
    session = JSON.parse(session)

    // Make sure our session has not expired
    if (session.expiry == null || Date.parse(session.expiry) > Date.now()) {
      return session
    }
  }

  return null
}
module.exports.getSession = getSession

// Clear an existing session and revoke the session's token
function clearSession() {
  const session = getSession()
  if (session != null) {
    fetch(`${KEYGEN_REQUEST_BASEURL}/tokens/${session.id}`, {
      headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Bearer ${session.token}` }),
      method: "DELETE"
    })
  }

  store.delete("currentUser")
  store.delete("session")

  ipcRenderer.send("unauthenticated")
}
module.exports.clearSession = clearSession

// Authenticate the user and create a new token if one is not in local storage
async function createSession(email, password) {
  const credentials = new Buffer(`${email}:${password}`).toString("base64")
  const auth = await fetch(`${KEYGEN_REQUEST_BASEURL}/tokens`, {
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Basic ${credentials}` }),
    method: "POST"
  })

  // Get the newly created authentication token
  const { data, errors } = await auth.json()
  if (errors) {
    return { errors }
  }

  const { id, attributes: { token, expiry } } = data

  // Store session
  store.set("session", JSON.stringify({ id, token, expiry }))

  // Get the current user
  const profile = await fetch(`${KEYGEN_REQUEST_BASEURL}/profile`, {
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Bearer ${token}` }),
    method: "GET"
  })
  const { data: user } = await profile.json()
  store.set("currentUser", JSON.stringify(user))

  return { id, token, expiry }
}
module.exports.createSession = createSession

// Get all of the user's licenses for the product
const validatedLicenses = {
  [KEYGEN_FEATURE_1]: {},
  [KEYGEN_FEATURE_2]: {},
  [KEYGEN_FEATURE_3]: {}
}

function resetValidatedLicenses() {
  Object.keys(validatedLicenses).forEach(key => {
    validatedLicenses[key] = {}
  })
}
module.exports.resetValidatedLicenses = resetValidatedLicenses

async function getLicenses(revalidate = false) {
  const session = getSession()
  if (session == null) {
    ipcRenderer.send("unauthenticated")
  }

  if (!revalidate && Object.values(validatedLicenses).every(l => Object.keys(l).length)) {
    return {
      licenses: validatedLicenses
    }
  }

  const licenses = await fetch(`${KEYGEN_REQUEST_BASEURL}/licenses?product=${KEYGEN_PRODUCT_ID}`, {
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Bearer ${session.token}` }),
    method: "GET"
  })
  // Handle case where the token that we've stored in a session has expired
  // or has been revoked
  if (licenses.status === 401) {
    return clearSession() // This will redirect to the login page
  }

  const { data, errors } = await licenses.json()
  if (errors) {
    return { errors }
  }

  const validations = data.map(async license => {
    const { id, relationships: { policy: { data: policy } } } = license

    switch (policy.id) {
      case KEYGEN_FEATURE_1:
      case KEYGEN_FEATURE_2:
      case KEYGEN_FEATURE_3:
        const validation = await fetch(`${KEYGEN_REQUEST_BASEURL}/licenses/${id}/actions/validate`, {
          headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, { "Authorization": `Bearer ${session.token}` }),
          method: "GET"
        })

        const { meta, data } = await validation.json()
        validatedLicenses[policy.id] = { meta, data }

        break
      default:
        // This version of our app doesn't use this policy so it's okay to skip it
        break
    }

    return Promise.resolve()
  })

  // Wait for validations to finish
  await Promise.all(validations)

  // Return an object containing the validated licenses for the user
  return {
    licenses: validatedLicenses
  }
}
module.exports.getLicenses = getLicenses