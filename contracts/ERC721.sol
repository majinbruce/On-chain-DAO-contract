// SPDX-License-Identifier: UNLISENCED
pragma solidity 0.8.8;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract MyNFT is ERC721URIStorage, ERC721Votes, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    constructor(string memory NFTName, string memory NFTSymbol)
        ERC721(NFTName, NFTSymbol)
        ERC721Votes()
        EIP712(NFTName, "1")
    {}

    function mintNFT(string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function burn(uint256 itemId) public {
        _burn(itemId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 itemId
    ) internal virtual override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, itemId);
    }

    function _burn(uint256 itemId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(itemId);
    }

    function tokenURI(uint256 itemId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(itemId);
    }
}
