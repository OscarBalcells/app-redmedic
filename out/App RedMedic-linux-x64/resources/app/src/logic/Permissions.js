import Database from "./Database.js";
import Profile from "./Profile.js";

const Web3 = require("web3");
const ethereumjs = require("ethereumjs-tx");
const mphrAbi = '[{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"deletePPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"getPPHR","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"acta","outputs":[{"internalType":"contract Acta","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"gateways","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"actaAddr","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"}],"name":"revokeAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"pphrAddr","type":"address"}],"name":"newPPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnGateways","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"},{"internalType":"uint256","name":"nHours","type":"uint256"}],"name":"grantAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_id","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]';

export default class Permissions {
	//doc is an Object with the parameters id and pphrAddr -> {id,pphrAddr}
	constructor(doc) {
		this.id = doc["id"];
		this.nonce = 0;
		this.name = doc["name"];
		this.profileId = doc["profileId"];
		this.rights = this.decode(doc["rights"]);
		this.validCats = ["all","allergies","conditions","immunizations",
		"labs","medications","procedures","images"];
		this.web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
	}

	getAdded() {
		let addrs = [];
		for(var prop in this.rights) {
			if(this.rights[prop].hasOwnProperty("display")) addrs.push(prop);
		}
		return addrs;
	}

	newElement(addr, display, categories) {
		this.rights[addr] = {
			"display": display,
			"categories": "",
		}
		this.applyChanges(categories, addr);
	}

	deleteElement(addr) {
		this.applyChanges("", addr);
		delete this.rights[addr].display;
		delete this.rights[addr];
		this.update();
	}

	applyChanges(newStr, addr, del) {
		let prev = {};
		let now = {};

		let cats = this.rights[addr].categories.split(", ");
		for(let i = 0; i < cats.length; i++) {
			let cat = cats[i];
			prev[cat] = true;
		}

		cats = newStr.split(", ");
		for(let i = 0; i < cats.length; i++) {
			let cat = cats[i];
			now[cat] = true;
		}


		Profile.getProfileById(this.profileId).then(profile => {
			this.web3.eth.getTransactionCount(profile.wallet.addr).then(_nonce => {
				let nonce = _nonce;
				for(let i = 0; i < this.validCats.length; i++) {
					let cat = this.validCats[i];
					if(prev[cat] !== now[cat]) {
						if(prev[cat] === true && now[cat] !== true) this.revokeAccess(addr, cat, nonce, profile);
						else if(prev[cat] !== true && now[cat] === true) this.grantAccess(addr, cat, nonce, profile);
						nonce++;
					}
				}

				try {
					let display = this.rights[addr].display;
					this.rights[addr] = {
						"categories":newStr,
						"display": display,
					};
					this.update();
				} catch(err) {
					//it has been deleted at deleteElement
				}
			});
		});
	}

	//to which address, what sections and the name of the pphr
	grantAccess(addr, section, nonce, profile) {
		let privateKey = new Buffer(profile.wallet.privKey, "hex");
		let mphr = new this.web3.eth.Contract(JSON.parse(mphrAbi));
		let data = mphr.methods.grantAccess(this.web3.utils.fromAscii(this.name).padEnd(66,'0'),addr,this.web3.utils.fromAscii(section).padEnd(66,'0'),0).encodeABI();

		let tx = new ethereumjs.Transaction({
			nonce: nonce,
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei("20","gwei")),
			gasLimit: 500000,
			to: profile.mphr,
			value: 0,
			data: data
		}, {'chain':'rinkeby'});

		tx.sign(privateKey);
		var raw = '0x'+tx.serialize().toString("hex");

		try {
			this.web3.eth.sendSignedTransaction(raw, function(error,transactionHash) {
				if("Error",error) {
					console.log(error);
				} else {
					console.log("Grant-Permission tx sent successfully:",transactionHash);
				}
			});
		} catch(error) {
			console.log(error);
		}
	}

	revokeAccess(addr, section, nonce, profile) {
		let privateKey = new Buffer(profile.wallet.privKey, "hex");
		let mphr = new this.web3.eth.Contract(JSON.parse(mphrAbi));
		let data = mphr.methods.revokeAccess(this.web3.utils.fromAscii(this.name).padEnd(66,'0'),addr,this.web3.utils.fromAscii(section).padEnd(66,'0')).encodeABI();

		console.log("Nonce:",profile.nonce);

		let tx = new ethereumjs.Transaction({
			nonce: nonce,
			gasPrice: this.web3.utils.toHex(this.web3.utils.toWei("20","gwei")),
			gasLimit: 500000,
			to: profile.mphr,
			value: 0,
			data: data
		}, {'chain':'rinkeby'});

		tx.sign(privateKey);
		var raw = '0x'+tx.serialize().toString("hex");

		try {
			this.web3.eth.sendSignedTransaction(raw, function(error,transactionHash) {
				if("Error",error) {
					console.log(error);
				}
				console.log("Revoke-Permission tx sent successfully:",transactionHash);
			});
		} catch(error) {
			console.log(error);
		}
	}

	encode() {
		let str = "";
		let addrs = this.getAdded();
		for(let i = 0; i < addrs.length; i++) {
			let addr = addrs[i];
			if(i > 0) str += "...";
			str += addr;
			str += ",,,";
			str += this.rights[addr].display;
			str += ",,,";
			str += this.rights[addr].categories;
		}
		return str;
	}

	decode(str) {
		if(str === "") return [];
		let array = {};
		let els = str.split("...");
		for(let i = 0; i < els.length; i++) {
			let el = els[i].split(",,,");
			let addr = el[0];
			let display = el[1];
			let categories = el[2];
			let obj = {
				"display": display,
				"categories": categories
			}
			array[addr] = obj;
		}
		return array;
	}

	toObject() {
		let rightsStr = this.encode();
		const obj = {
			id: this.id,
			name: this.name,
			profileId: this.profileId,
			rights: rightsStr,
			type: "permissions"
		}
		return obj;
	}

	//Database helper functions for retrieving and storing profiles
	static get store() {
		if(!Permissions.__store) {
			Permissions.__store = new Database("permissions");
		}
		return Permissions.__store;
	}

	static all() {
		return Permissions.store.find({
			type: "permissions"
		}).then((docs) => {
			return docs.map(doc => new Permissions(doc));
		});
	}

	static getPermissionsById(id) {
		return Permissions.store.find({
			id: id
		}).then((docs) => {
			return docs.map(doc => new Permissions(doc))[0];
		});
	}

	save() {
		return Permissions.store.insert(this.toObject());
	}

	erase() {
		try {
			Permissions.store.remove({id:this.id});
		} catch(error) {
			console.log(error);
		}
	}

	update() {
		this.erase();
		this.save();
	}

}
