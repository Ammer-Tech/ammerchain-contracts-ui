/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */

class ERC20 {
  constructor (name, symbol, emission, mintable, burnable) {
    this.name = name
    this.symbol = symbol

    const request = new XMLHttpRequest()
    request.open('GET', '/contracts/erc20.sol', false)
    request.send(null)
    let contract = request.responseText

    contract = contract.replace('{name}', name)
    contract = contract.replace('{symbol}', symbol)
    contract = contract.replace('{supply}', emission)
    if (mintable) {
      contract = contract.replace('{mintableImport}', 'import "@openzeppelin/contracts/access/Ownable.sol";')
      contract = contract.replace('{mintableParent}', ', Ownable')
      contract = contract.replace('{mintableFunction}', `
      function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
      }
      `)
    } else {
      contract = contract.replace('{mintableImport}', '')
      contract = contract.replace('{mintableParent}', '')
      contract = contract.replace('{mintableFunction}', '')
    }
    if (burnable) {
      contract = contract.replace('{burnableImport}', 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";')
      contract = contract.replace('{burnableParent}', ', ERC20Burnable')
    } else {
      contract = contract.replace('{burnableImport}', '')
      contract = contract.replace('{burnableParent}', '')
    }

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
    const coin = this
    return new Promise(async function (resolve, reject) {
      const accounts = await window.web3.eth.getAccounts()
      coin.contract = new window.web3.eth.Contract(coin.interface)
      coin.contract
        .deploy({ data: coin.bytecode })
        .send({ from: accounts[0], gas: '3000000' })
        .on('receipt', receipt => {
          coin.address = receipt.contractAddress
          resolve(coin)
        })
    })
  }

  transferOwnership (newOwner) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.transferOwnership(newOwner).send({ from: this.owner })
  }

  burn (amount) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.burn(window.web3.utils.toWei(amount)).send({ from: this.owner })
  }

  mint (amount) {
    const contract = new window.web3.eth.Contract(this.interface, this.address)
    return contract.methods.mint(this.owner, window.web3.utils.toWei(amount)).send({ from: this.owner })
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

  updateLogo (logo) {
    const data = new FormData()
    data.append('file', logo)
    data.append('dir', 'crypto-icons/128')
    data.append('name', this.symbol.toLowerCase() + logo.name.substring(logo.name.length - 4, logo.name.length))

    fetch('/upload', {
      method: 'POST',
      body: data
    }).then(response => {
      if (response.status === 200) {
        alert('Logo updated')
      } else {
        alert('Error updating logo')
      }
    })
  }
}

async function loadERC20 (address) {
  const request = new XMLHttpRequest()
  request.open('GET', '/contracts/erc20.json', false)
  request.send(null)
  const abi = request.responseText

  const coin = new ERC20()
  coin.interface = JSON.parse(abi)

  coin.address = address

  coin.supply = await coin.getSupply()
  coin.supply = window.web3.utils.fromWei(coin.supply, 'ether')

  coin.owner = await coin.getOwner()

  coin.name = await coin.getName()
  coin.symbol = await coin.getSymbol()

  return coin
}
