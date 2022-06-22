/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */

class ERC721 {
  constructor (name, symbol) {
    this.name = name
    this.symbol = symbol

    const request = new XMLHttpRequest()
    request.open('GET', '/contracts/erc721.sol', false)
    request.send(null)
    let contract = request.responseText

    contract = contract.replace('{name}', name)
    contract = contract.replace('{symbol}', symbol)
    contract = contract.replace(
      '{folder}',
      name.toLowerCase().replace(/\s/g, '')
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
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods
      .safeMint(this.owner)
      .send({ from: this.owner })
  }

  getOwner () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.owner().call()
  }

  getSupply () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.totalSupply().call()
  }

  getName () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.name().call()
  }

  getSymbol () {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.symbol().call()
  }
}

function getTokenMetadata (tokenId) {
  const contract = new window.web3.eth.Contract(
    window.erc721.interface,
    window.erc721.address
  )
  return contract.methods.tokenMetadata(tokenId).call()
}

async function loadERC721 (address) {
  const request = new XMLHttpRequest()
  request.open('GET', '/contracts/erc721.json', false)
  request.send(null)
  const abi = request.responseText

  const nft = new ERC721()
  nft.interface = JSON.parse(abi)

  nft.address = address

  nft.supply = await nft.getSupply()
  nft.supply = window.web3.utils.fromWei(nft.supply, 'ether')

  nft.owner = await nft.getOwner()

  nft.name = await nft.getName()
  nft.symbol = await nft.getSymbol()

  return nft
}
