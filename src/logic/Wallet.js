const bip39 = require("bip39");
const hdkey = require("hdkey");
const ethUtil = require("ethereumjs-util");
import Database from "./Database.js";

export default class Wallet {

  constructor(mnemonic) {
		const seed = bip39.mnemonicToSeed(mnemonic);
		const root = hdkey.fromMasterSeed(seed);
		const addrNode = root.derive("m/44'/60'/0'/0/0");
		const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
		const addr = ethUtil.publicToAddress(pubKey).toString("hex");

		this.addr = ethUtil.toChecksumAddress(addr);
		this.privKey = addrNode._privateKey.toString("hex");
	}

	static generateMnemonic() {
		return bip39.generateMnemonic();
	}

	signData(data) {

		const msgBuffer = ethUtil.toBuffer(data);
		const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
		const privateKey = new Buffer(this.privKey, "hex");
		const sig = ethUtil.ecsign(msgHash, privateKey);
		const publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
		const bufferAddr = ethUtil.publicToAddress(publicKey);
		const addr = ethUtil.bufferToHex(bufferAddr);
		const sigHex = "0x"+sig.r.toString("hex")+sig.s.toString("hex")+sig.v.toString(16);

		if(this.addr.toLowerCase() === addr.toLowerCase()) {
			return sigHex;
		} else {
			console.log(sigHex);
			throw ("Invalid signature");
		}
	}

}
