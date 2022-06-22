// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
{burnableImport}
{mintableImport}

/// @custom:security-contact nikita.nikonov@ammer.group
contract Token is ERC20 {burnableParent} {mintableParent} {
    constructor() ERC20("{name}", "{symbol}") {
        _mint(msg.sender, {supply} * 10 ** decimals());
    }

    {mintableFunction}
}
