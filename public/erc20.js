class ERC20 {
    constructor(name, symbol, emission, mintable, burnable) {
        this.name = name;
        this.symbol = symbol;

        var request = new XMLHttpRequest();
        request.open('GET', '/coin.sol', false);
        request.send(null);
        let contract = request.responseText

        contract = contract.replace('${name}', name)
        contract = contract.replace('${symbol}', symbol)
        contract = contract.replace('${supply}', emission)
        if (mintable) {
            contract = contract.replace('mintable*/', '*/')
            contract = contract.replace('nonmintable*/', '')
        } else {
            contract = contract.replace('mintable*/', '')
            contract = contract.replace('nonmintable*/', '*/')
        }
        if (burnable) {
            contract = contract.replace('burnable*/', '*/')
            contract = contract.replace('nonburnable*/', '')
        } else {
            contract = contract.replace('burnable*/', '')
            contract = contract.replace('nonburnable*/', '*/')
        }

        this.code = contract
    }

    async compile() {
        const result = await fetch('/compile', {
            method: "POST",
            body: JSON.stringify({
                code: this.code
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const json = await result.json();
        this.bytecode = json.bytecode;
        this.interface = json.interface;
    }

    deploy() {
        const coin = this
        return new Promise(async function (resolve, reject) {
            setupAmmerChain()

            const accounts = await web3.eth.getAccounts();
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

    transferOwnership(newOwner) {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.transferOwnership(newOwner).send({ from: this.owner })
    }

    burn(amount) {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.burn(window.web3.utils.toWei(amount)).send({ from: this.owner })
    }

    mint(amount) {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.mint(window.web3.utils.toWei(amount)).send({ from: this.owner })
    }

    getOwner() {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.owner().call()
    }

    getSupply() {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.totalSupply().call()
    }

    getName() {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.name().call()
    }

    getSymbol() {
        let contract = new window.web3.eth.Contract(this.interface, this.address)
        return contract.methods.symbol().call()
    }
}

async function loadERC20(address) {
    setupAmmerChain()

    var request = new XMLHttpRequest();
    request.open('GET', 'coin.json', false);
    request.send(null);
    let abi = request.responseText

    let coin = new ERC20();
    coin.interface = JSON.parse(abi);

    coin.address = address;

    coin.supply = await coin.getSupply()
    coin.supply = window.web3.utils.fromWei(coin.supply, 'ether')

    coin.owner = await coin.getOwner()

    coin.name = await coin.getName()
    coin.symbol = await coin.getSymbol()

    return coin;
}