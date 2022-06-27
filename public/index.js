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
                        <button onclick="saveToTrustody(${loaded.address}, 'prod');" class="btn btn-sm btn-danger m-1">Save to Trustody <b>Prod</b></button>
                        <button onclick="saveToTrustody(${loaded.address}, 'demo');" class="btn btn-sm btn-success m-1">Save to Trustody <b>Demo</b></button>
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
      loadedNFT = await loadERC721(document.getElementById('loadAddressNFT').value)

      const element = `
      <hr>
      <h3 class="mt-4 fs-4">
          ${loadedNFT.name} (${loadedNFT.symbol})
      </h3>
      <p>
          <span class="badge rounded-pill text-bg-light"><a
                  href="https://ammer.network/address/${loadedNFT.owner}">${loadedNFT.owner}</a>
              owner</span>
      </p>
      <div class="my-2">
          <button onclick="saveToTrustody(${loadedNFT.address}, 'prod');"
              class="btn btn-sm btn-danger m-1">Save to Trustody <b>Prod</b></button>
          <button onclick="saveToTrustody(${loadedNFT.address}, 'demo');"
              class="btn btn-sm btn-success m-1">Save to Trustody <b>Demo</b></button>
      </div>
      <div class="my-3 pb-3">
          <label for="exampleInputEmail1" class="form-label">Transfer Ownership to address (it will be
              able to
              manage collection)</label>
          <div class="input-group">
              <input id="transferNFTAddress" type="text"
                  placeholder="0x0000000000000000000000000000000000000000" class="form-control" />
              <button id="transferOwnershipButtonNFT" class="btn btn-dark" type="button">
                  Transfer
              </button>
          </div>
      </div>

      <form id="newToken" class="card p-3 bg-light">
          <h3 class="pb-2 fs-4">Mint new token (to collection)</h3>
          <div>
              <div class="row">
                  <div class="mb-3 col">
                      <label for="tokenName" class="form-label">Name</label>
                      <input id="tokenName" required placeholder="Davos 2022 Vase" type="text"
                          class="form-control" />
                  </div>
                  <div class="mb-3 col">
                      <label for="tokenImage" class="form-label">Image</label>
                      <input type="file" id="tokenImage" required class="form-control" />
                  </div>
              </div>
              <div class="row mb-3">
                  <label for="tokenDescription" class="form-label">Description</label>
                  <div class="">
                      <textarea required id="tokenDescription" class="form-control"
                          placeholder="The ancient vase #0 of Davos 2022 Collection"></textarea>
                  </div>
              </div>
              <button type="submit" class="btn btn-dark">
                  Mint
              </button>
          </div>
      </form>

      <div id="tokens" class="mt-3">

      </div>
      `
      document.getElementById('loadedNFT').innerHTML = element

      document.getElementById('newToken').addEventListener(
        'submit',
        async (e) => {
          e.preventDefault()

          const index = await loadedNFT.mint()
          if (index === null) return
          console.log(index)

          const file = document.getElementById('newToken').querySelector('input[type="file"]').files[0]
          const metadata = {
            name: document.getElementById('tokenName').value,
            image: `https://static.trustody.io/public/media/nft/${loadedNFT.symbol.toLowerCase().replace(/\s/g, '')}/${index + 'token' + file.name.substring(file.name.length - 4, file.name.length)}`,
            description: document.getElementById('tokenDescription').value
          }
          await loadedNFT.saveSubTokenFiles(index, file, metadata)

          const elem = await loadedNFT.buildSubToken(index)
          document.getElementById('tokens').innerHTML = document.getElementById('tokens').innerHTML + elem
        }
      )

      document.getElementById('tokens').innerHTML = ''
      for (let i = 0; i < Infinity; i++) {
        const html = await loadedNFT.buildSubToken(i)
        if (html === 'error') return alert('All NFTs in collection\'re loaded')
        document.getElementById('tokens').innerHTML = document.getElementById('tokens').innerHTML + html
      }
    }

    document.getElementById('transferOwnershipButtonNFT').addEventListener(
      'click',
      (e) => {
        const address = document.getElementById('transferNFTAddress').value
        loadedNFT.transferOwnership(address)
      })
  }
)

// eslint-disable-next-line no-unused-vars
async function sendNFT (i) {
  const address = prompt('Paste address of the recipient')
  loadedNFT.send(web3.utils.toChecksumAddress(address), i)
    .on('receipt', (receipt) => {
      alert(` #${i} sent successfully!`)
    })
    .on('error', (error) => {
      console.log(error)
      alert(`Couldn't send #${i}`)
    })
}
