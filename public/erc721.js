/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */

class ERC721 {
  constructor (name, symbol) {
    this.name = name || ''
    this.symbol = symbol || ''

    const request = new XMLHttpRequest()
    request.open('GET', '/contracts/erc721.sol', false)
    request.send(null)
    let contract = request.responseText

    contract = contract.replace('{name}', name)
    contract = contract.replace('{symbol}', symbol)
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
        .send({ from: accounts[0], gas: '3000000' })
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

  send (to, tokenId) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods
      .safeTransferFrom(this.owner, to, tokenId)
      .send({ from: this.owner })
  }

  mint () {
    const nft = this
    return new Promise(async function (resolve, reject) {
      const contract = new window.web3.eth.Contract(nft.interface, nft.address)
      contract.methods
        .safeMint(nft.owner)
        .send({ from: nft.owner })
        .on('receipt', (receipt) => {
          resolve(receipt.events.Transfer.returnValues.tokenId)
        })
        .on('error', (error) => {
          console.log(error)
          resolve(null)
        })
    })
  }

  getOwner () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.owner().call()
  }

  getName () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.name().call()
  }

  getSymbol () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.symbol().call()
  }

  getTokenMetadataURI (tokenId) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.tokenURI(tokenId).call()
  }

  getSubtokenOwner (tokenId) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.ownerOf(tokenId).call()
  }

  async buildSubToken (i) {
    const accounts = await window.web3.eth.getAccounts()
    let metadataURI
    let owner
    try {
      metadataURI = await this.getTokenMetadataURI(i)
      owner = await this.getSubtokenOwner(i)
    } catch (e) {
      return 'error'
    }
    try {
      const res = await fetch(metadataURI)
      const metadata = await res.json()
      const elem = `
    <div style="" class="nft-token card p-2 my-2">
        <p class="my-2 fw-bold">#${i} <a href="${metadataURI}">${metadata.name}</a></p>
        <a class="my-2" href="${metadata.image}"><img
                style="height: auto;width: 100%; margin: 0 auto;object-fit: cover;"
                src="${metadata.image}" loading="lazy">
        </a>
        ${owner === accounts[0]
          ? `<button onclick="sendNFT(${i})" class="my-2 btn btn-sm btn-dark">Send</button>`
          : `<p class="my-2 fw-bold"><a href="https://ammer.network/address/${owner}">owner ${owner.substring(0, 5)}...${owner.substring(owner.length - 4, owner.length)}</a></p>`}
        <!-- TODO: 'Edit' button to update photo or text (name, description) of the token -->
    </div>
    `
      return elem
    } catch (e) {
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
    data.append('name', index)
    fetch('/upload', {
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
    fetch('/upload', {
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

async function loadERC721 (address) {
  const request = new XMLHttpRequest()
  request.open('GET', '/contracts/erc721.json', false)
  request.send(null)
  const abi = request.responseText

  const nft = new ERC721()
  nft.interface = JSON.parse(abi)

  nft.address = address

  nft.owner = await nft.getOwner()

  nft.name = await nft.getName()
  nft.symbol = await nft.getSymbol()

  return nft
}
