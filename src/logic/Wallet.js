const bip39 = require("bip39");
const hdkey = require("hdkey");
const ethUtil = require("ethereumjs-util");
import Database from "./Database.js";

class Wallet {

    constructor(name, mnemonic) {

			const seed = bip39.mnemonicToSeed(mnemonic);
			const root = hdkey.fromMasterSeed(seed);
			const addrNode = root.derive("m/44'/60'/0'/0/0");
			const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
			const addr = ethUtil.publicToAddress(pubKey).toString("hex");

			this.name = name;
			this.address = ethUtil.toChecksumAddress(addr);
			this.privKey = addrNode._privateKey.toString("hex");
		}

		static generateMnemonic() {
			return bip39.generateMnemonic();
		}

}


export default Wallet;
