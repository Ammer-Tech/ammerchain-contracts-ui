/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */

class ERC1155 {
  constructor (symbol) {
    this.symbol = symbol || ''

    const request = new XMLHttpRequest()
    request.open('GET', '/contracts/erc1155.sol', false)
    request.send(null)
    let contract = request.responseText

    contract = contract.replace(
      '{folder}',
      this.symbol.toLowerCase().replace(/\s/g, '')
    ) // set lower case and remove spaces from name

    this.code = contract
  }

  async compile () {
    const result = await fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({
        code: this.code
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const json = await result.json()
    this.bytecode = json.bytecode
    this.interface = json.interface
  }

  deploy () {
    const nft = this
    return new Promise(async function (resolve, reject) {
      const accounts = await window.web3.eth.getAccounts()
      nft.contract = new window.web3.eth.Contract(nft.interface)
      nft.contract
        .deploy({ data: nft.bytecode })
        .send({ from: accounts[0], gas: '5000000' })
        .on('receipt', (receipt) => {
          nft.address = receipt.contractAddress
          resolve(nft)
        })
    })
  }

  transferOwnership (newOwner) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods
      .transferOwnership(newOwner)
      .send({ from: this.owner })
  }

  send (to, tokenId, amount) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods
      .safeTransferFrom(this.owner, to, tokenId, amount, '0x')
      .send({ from: this.owner })
  }

  mint (id, amount) {
    const nft = this
    return new Promise(async function (resolve, reject) {
      const contract = new window.web3.eth.Contract(nft.interface, nft.address)
      contract.methods
        .mint(nft.owner, id, amount, '0x')
        .send({ from: nft.owner })
        .on('receipt', (receipt) => {
          resolve(true)
        })
        .on('error', (error) => {
          console.log(error)
          resolve(false)
        })
    })
  }

  burn (id, amount) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods
      .burn(this.owner, id, amount)
      .send({ from: this.owner })
  }

  getOwner () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.owner().call()
  }

  getTokenMetadataURI (tokenId) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.uri(tokenId).call()
  }

  getSubtokenBalance (tokenId, address) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.balanceOf(address, tokenId).call()
  }

  failedAttempts = 0

  async buildSubToken (i) {
    const accounts = await window.web3.eth.getAccounts()
    let metadataURI
    let balance
    try {
      metadataURI = await this.getTokenMetadataURI(i)
      metadataURI = metadataURI.replace('{id}', i)
      console.log(metadataURI)
      balance = await this.getSubtokenBalance(i, accounts[0])
      console.log(balance)
    } catch (e) {
      return 'error'
    }
    try {
      const res = await fetch(metadataURI)
      const metadata = await res.json()
      const elem = `
    <div style="" class="nft-token card p-2 my-2">
        <p class="my-2 fw-bold">#${i} <a href="${metadataURI}">${metadata.name}</a></p>
        <p>Balance: ${balance}</p>
        <a class="my-2" href="${metadata.image}"><img
                style="height: auto;width: 100%; margin: 0 auto;object-fit: cover;"
                src="${metadata.image}" loading="lazy">
        </a>
        <button onclick="sendNFT1155(${i})" ${balance === 0 ? 'disabled' : ''} class="my-2 btn btn-sm btn-dark">Send</button>
        <!-- TODO: 'Edit' button to update photo or text (name, description) of the token -->
    </div>
    `
      return elem
    } catch (e) {
      if (this.failedAttempts >= 3) {
        return 'error'
      }
      this.failedAttempts += 1
      return `
      <div style="" class="nft-token card p-2 my-2">
          <p class="my-2 fw-bold">Couldn't load token #${i}</p>
      </div>
      `
    }
  }

  async saveSubTokenFiles (index, image, metadata) {
    let data = new FormData()
    const metadataFile = new Blob([JSON.stringify(metadata)], { type: 'text/plain' })
    data.append('file', metadataFile)
    data.append('dir', `nft/${this.symbol.toLowerCase().replace(/\s/g, '')}`)
    data.append('name', index + '.json')
    await fetch('/upload', {
      method: 'POST',
      body: data
    }).then(response => {
      if (response.status === 200) {
        alert('Metadata uploaded')
      } else {
        return alert('Error uploading metadata')
      }
    })

    data = new FormData()
    data.append('file', image)
    data.append('dir', `nft/${this.symbol.toLowerCase().replace(/\s/g, '')}`)
    data.append('name', index + 'token' + image.name.substring(image.name.length - 4, image.name.length))
    await fetch('/upload', {
      method: 'POST',
      body: data
    }).then(response => {
      if (response.status === 200) {
        alert('Image uploaded')
      } else {
        return alert('Error uploading image')
      }
    })
  }
}

async function loadERC1155 (address, symbol) {
  const request = new XMLHttpRequest()
  request.open('GET', '/contracts/erc1155.json', false)
  request.send(null)
  const abi = request.responseText

  const nft = new ERC1155()
  nft.interface = JSON.parse(abi)

  nft.address = address
  nft.owner = await nft.getOwner()
  nft.symbol = symbol

  return nft
}
