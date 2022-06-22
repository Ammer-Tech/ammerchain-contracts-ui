/* eslint-disable no-undef */
// TODO: notify if can't do smth (catch errors)

document.getElementById('deploy').addEventListener(
  'click',
  async (e) => {
    const metamask = await connected()
    if (metamask) {
      const coin = new ERC20(
        document.getElementById('name').value,
        document.getElementById('symbol').value,
        document.getElementById('emission').value,
        document.getElementById('mintable').checked,
        document.getElementById('burnable').checked
      )
      await coin.compile()
      await coin.deploy().then((deployed) => {
        const element = `
                        <hr>
                        <div class="p-1">
                            <label for="a${deployed.address}" class="form-label">Deployed: <code>${deployed.name}</code></label>
                            <div class="input-group">
                                <input id="a${deployed.address}" type="text" readonly value="${deployed.address}" class="form-control" />
                                <button class="btn btn-dark" type="button" data-clipboard-target="#a${deployed.address}">
                                    Copy
                                </button>
                            </div>
                        </div>
                        `
        document.getElementById('deployedCoins').innerHTML = document.getElementById('deployedCoins').innerHTML + element
        addCoinToMetamask(deployed)
      })
    }
  },
  true
)

let loaded
document.getElementById('load').addEventListener(
  'click',
  async (e) => {
    const metamask = await connected()
    if (metamask) {
      loaded = await loadERC20(document.getElementById('loadAddress').value)

      const element = `
                    <hr>
                    <h3 class="mt-4 fs-4">
                        ${loaded.name} (${loaded.symbol})
                    </h3>
                    <p>
                        <span class="badge rounded-pill text-bg-light"><a href="https://ammer.network/address/${loaded.owner}">${loaded.owner}</a> owner</span>
                        <span class="badge rounded-pill text-bg-light">${loaded.supply} supply</span>
                    </p>
                    <div class="my-2">
                        <button onclick="saveToTrustody(loaded.address, 'prod');" class="btn btn-sm btn-danger m-1">Save to Trustody <b>Prod</b></button>
                        <button onclick="saveToTrustody(loaded.address, 'prod');" class="btn btn-sm btn-success m-1">Save to Trustody <b>Demo</b></button>
                        <button onclick="addCoinToMetamask(loaded);" class="btn btn-sm btn-warning m-1 text-light">Add coin to <b>Metamask</b></button> 
                    </div>
                    <div class="my-3">
                        <form id="updateCoinLogo">
                            <label for="exampleInputEmail1" class="form-label">Update (Set) Logo in Trustody. Must be .png!</label>
                            <div class="input-group">
                                <input type="file" required class="form-control" />
                                <button class="btn btn-dark" type="submit">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                    <div class="my-3">
                        <label for="exampleInputEmail1" class="form-label">Transfer Ownership of contract to address</label>
                        <div class="input-group">
                            <input id="transferAddress" type="text" placeholder="0x0000000000000000000000000000000000000000" class="form-control" />
                            <button id="transferButton" class="btn btn-dark" type="button">
                                Transfer
                            </button>
                        </div>
                    </div>
                    <div class="my-3">
                        <label for="exampleInputEmail1" class="form-label">Mint Coins (to your address)</label>
                        <div class="input-group">
                            <input id="mintAmount" type="number" placeholder="100000" class="form-control" />
                            <button id="mintButton" class="btn btn-dark" type="button">
                                Mint
                            </button>
                        </div>
                    </div>
                    <div class="mt-3">
                        <label for="exampleInputEmail1" class="form-label">Burn Coins (from your
                            address)</label>
                        <div class="input-group">
                            <input id="burnAmount" type="number" placeholder="100000" class="form-control" />
                            <button id="burnButton" class="btn btn-dark" type="button">
                                Burn
                            </button>
                        </div>
                    </div>
                    `

      document.getElementById('loadedCoin').innerHTML = element
    }

    document.getElementById('transferButton').addEventListener(
      'click',
      (e) => {
        const address = document.getElementById('transferAddress').value
        loaded.transferOwnership(address)
      })

    document.getElementById('mintButton').addEventListener(
      'click',
      (e) => {
        const amount = document.getElementById('mintAmount').value
        loaded.mint(amount)
      })

    document.getElementById('burnButton').addEventListener(
      'click',
      (e) => {
        const amount = document.getElementById('burnAmount').value
        loaded.burn(amount)
      })

    document.getElementById('updateCoinLogo').addEventListener(
      'submit',
      (e) => {
        e.preventDefault()
        const file = document.getElementById('updateCoinLogo').querySelector('input[type="file"]').files[0]
        loaded.updateLogo(file)
      })
  }
)

document.getElementById('deployNFT').addEventListener(
  'click',
  async (e) => {
    const metamask = await connected()
    if (metamask) {
      const nft = new ERC721(
        document.getElementById('nftName').value,
        document.getElementById('nftSymbol').value
      )
      await nft.compile()
      await nft.deploy().then((deployed) => {
        const element = `
                        <hr>
                        <div class="p-1">
                            <label for="a${deployed.address}" class="form-label">Deployed: <code>${deployed.name}</code></label>
                            <div class="input-group">
                                <input id="a${deployed.address}" type="text" readonly value="${deployed.address}" class="form-control" />
                                <button class="btn btn-dark" type="button" data-clipboard-target="#a${deployed.address}">
                                    Copy
                                </button>
                            </div>
                        </div>
                        `
        document.getElementById('deployedNFTs').innerHTML = document.getElementById('deployedNFTs').innerHTML + element
        addCoinToMetamask(deployed)
      })
    }
  },
  true
)

let loadedNFT
document.getElementById('loadNFT').addEventListener(
  'click',
  async (e) => {
    const metamask = await connected()
    if (metamask) {
      loadedNFT = await loadERC20(document.getElementById('loadAddressNFT').value)

      const element = `
                    <hr>
                    <h3 class="mt-4 fs-4">
                        ${loadedNFT.name} (${loadedNFT.symbol})
                    </h3>
                    <p>
                        <span class="badge rounded-pill text-bg-light"><a href="https://ammer.network/address/${loadedNFT.owner}">${loadedNFT.owner}</a> owner</span>
                        <span class="badge rounded-pill text-bg-light">${loadedNFT.supply} supply</span>
                    </p>
                    <div class="my-3">
                        <label for="exampleInputEmail1" class="form-label">Transfer Ownership of contract to address</label>
                        <div class="input-group">
                            <input id="transferAddress" type="text" placeholder="0x0000000000000000000000000000000000000000" class="form-control" />
                            <button id="transferButton" class="btn btn-dark" type="button">
                                Transfer
                            </button>
                        </div>
                    </div>
                    <div class="my-3">
                        <label for="exampleInputEmail1" class="form-label">Mint Coins (to your address)</label>
                        <div class="input-group">
                            <input id="mintAmount" type="number" placeholder="100000" class="form-control" />
                            <button id="mintButton" class="btn btn-dark" type="button">
                                Mint
                            </button>
                        </div>
                    </div>
                    <div class="my-3">
                        <label for="exampleInputEmail1" class="form-label">Burn Coins (it will burn coins from your
                            address)</label>
                        <div class="input-group">
                            <input id="burnAmount" type="number" placeholder="100000" class="form-control" />
                            <button id="burnButton" class="btn btn-dark" type="button">
                                Burn
                            </button>
                        </div>
                    </div>
                    `

      document.getElementById('loadedNFT').innerHTML = element
    }

    document.getElementsByClassName('transferButton').addEventListener('click', (e) => {
      const address = document.getElementById('transferAddress').value
      loadedNFT.transferOwnership(address)
    })

    document.getElementById('transferOwnershipButtonNFT').addEventListener(
      'click',
      (e) => {
        const address = document.getElementById('transferAddress').value
        loadedNFT.transferOwnership(address)
      })

    document.getElementById('mintButtonNFT').addEventListener(
      'click',
      (e) => {
        const amount = document.getElementById('mintAmount').value
        loadedNFT.mint(amount)
      })
  }
)
