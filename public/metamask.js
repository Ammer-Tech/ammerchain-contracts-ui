// connect to metamask
async function connected() {
    if (typeof web3 == "undefined") {
        alert(
            "You don't have Metamask extension in browser. Please install it and reload the page. You'll need to use a desktop computer."
        );
    }
    if (window.web3) {
        window.web3 = await new Web3(window.web3.currentProvider);
        await window.web3.currentProvider.enable()

        await setupAmmerChain()

        return true;
    }
    return false;
};

// change network
async function setupAmmerChain() {
    const chainId = 100 // Ammer Chain

    if (window.ethereum.networkVersion !== chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(chainId) }]
            });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: 'Ammer Chain',
                            chainId: web3.utils.toHex(chainId),
                            nativeCurrency: { name: 'Ammer Coin', decimals: 18, symbol: 'AMR' },
                            rpcUrls: ['http://ammer.network:10002']
                        }
                    ]
                });
            }
        }
    }
}

// add coin to metamask
function addCoinToMetamask(coin) {
    ethereum
        .request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: coin.address,
                    symbol: coin.symbol,
                    decimals: 18,
                    image: '',
                },
            },
        })
        .then((success) => {
            if (success) {
                console.log(coin.symbol + ' successfully added to wallet!');
            } else {
                throw new Error('Something went wrong.');
            }
        })
        .catch(console.error);
}
