/* eslint-disable no-unused-vars */

function saveToTrustody (address, environment) {
  const request = new XMLHttpRequest()
  request.open('POST', '/trustody', false)
  request.setRequestHeader('Content-Type', 'application/json')
  request.send(JSON.stringify({
    address,
    environment
  }))
  if (request.status === 200) {
    alert('Successfully saved to Trustody')
  } else {
    alert('Failed to save to Trustody')
  }
}
