// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Treasury is Ownable, ERC721Holder {
    using SafeERC20 for IERC20;

    function transferERC721Tokens(
        address _token,
        uint256 _tokenId,
        address _to
    ) external onlyOwner {
        require(
            IERC721(_token).ownerOf(_tokenId) == address(this),
            "Treasury: Does not hold these NFT tokens!"
        );
        IERC721(_token).safeTransferFrom(address(this), _to, _tokenId, "");
    }

    function transferERC20Tokens(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        require(
            IERC20(_token).balanceOf(address(this)) > _amount,
            "Treasury: Does not hold these ERC20 tokens!"
        );
        IERC20(_token).safeTransferFrom(address(this), _to, _amount);
    }
}
