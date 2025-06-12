"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedVoucher = generateSignedVoucher;
exports.verifyVoucher = verifyVoucher;
exports.tokensToWei = tokensToWei;
exports.weiToTokens = weiToTokens;
const ethers_1 = require("ethers");
// Configuration EIP712 pour le distributeur
const DOMAIN = {
    name: 'Distributor',
    version: '1',
    chainId: 480, // World Chain
    verifyingContract: '0xb525567dE6E171936aCB95698904634DA0a548C2' // Adresse du distributor
};
const TYPES = {
    Voucher: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ]
};
/**
 * Génère un voucher signé pour claim des tokens HODL
 */
async function generateSignedVoucher(userAddress, amount, privateKey) {
    // Créer le wallet signataire
    const wallet = new ethers_1.ethers.Wallet(privateKey);
    // Convertir amount en wei (18 decimals)
    const amountWei = ethers_1.ethers.parseEther(amount.toString());
    // Générer un nonce unique basé sur timestamp + address
    const nonce = Date.now().toString();
    // Deadline: 1 heure à partir de maintenant
    const deadline = Math.floor((Date.now() + 60 * 60 * 1000) / 1000).toString();
    // Créer le voucher
    const voucher = {
        to: userAddress,
        amount: amountWei.toString(),
        nonce,
        deadline
    };
    // Signer le voucher avec EIP712
    const signature = await wallet.signTypedData(DOMAIN, TYPES, voucher);
    console.log('🎫 Voucher généré:', {
        to: voucher.to,
        amount: `${amount} tokens (${voucher.amount} wei)`,
        nonce: voucher.nonce,
        deadline: new Date(parseInt(voucher.deadline) * 1000).toISOString(),
        signerAddress: wallet.address
    });
    return { voucher, signature };
}
/**
 * Vérifie qu'un voucher est valide
 */
function verifyVoucher(voucher, signature, expectedSigner) {
    try {
        const recoveredAddress = ethers_1.ethers.verifyTypedData(DOMAIN, TYPES, voucher, signature);
        return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
    }
    catch (error) {
        console.error('Erreur lors de la vérification du voucher:', error);
        return false;
    }
}
/**
 * Convertit un montant en tokens vers wei
 */
function tokensToWei(amount) {
    return ethers_1.ethers.parseEther(amount.toString()).toString();
}
/**
 * Convertit wei vers tokens
 */
function weiToTokens(amountWei) {
    return parseFloat(ethers_1.ethers.formatEther(amountWei));
}
