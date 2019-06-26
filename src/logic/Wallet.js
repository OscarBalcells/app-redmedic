const bip39 = require("bip39");
const hdkey = require("hdkey");
const ethUtil = require("ethereumjs-util");
import Database from "./Database.js";

class Wallet {

    constructor(name, mnemonic) {

			console.log(mnemonic);
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

		static get store() {
        if (!Wallet.__store) {
					Wallet.__store = new Database("wallets");
				}
				return Wallet.__store;
    }

    static all() {
        return Wallet.store.find({ type: this.type }).then((docs) => {
            return docs.map(doc => new Wallet(doc));
        });
    }

		save() {
        return Wallet.store.insert(this.toObject());
    }

    erase() {
        Wallet.store.remove({ address: this.address });
    }


    toObject() {

        const obj = {
            name: this.name,
            address: this.address,
            privKey: this.privKey,
            type: "wallet",
        };

        return obj;
    }


}

// Wallet.Defaults = {
//     Encryption: 'aes-256-cbc',
//     Path: "m/44'/0'/0'/0/0",
//     DBFileName: 'wallets',
// };
//
// Wallet.Events = {
//   Updated: 'updated',
// };


export default Wallet;
