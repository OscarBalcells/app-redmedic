import Database from "./Database.js";
import Profile from "./Profile.js";

const Web3 = require("web3");
const ethereumjs = require("ethereumjs-tx");

let validCats = ["all","allergies","conditions","immunizations",
"labs","medications","procedures","images"];

//this creates a class, which represents a certain permission
//a permition is basically a mapping of addresses to specific access rights
/*
{
	"id": "0x...",
	"nonce": 0,
	"name": "Corachan",
	"profileId": "123456789",
	"rights": {
		"0x...": {
			display: "researcher",
			categories: "allergies, labs"
		}
	}
	"rights": [
	{
		"display": "researcher at UB",
		"categories": "all"
	},
	{
		"display": "hospital X",
		"categories": "labs, allergies"
	}
	]
}
*/

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

const mphrAbi = '[{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"deletePPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"getPPHR","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"acta","outputs":[{"internalType":"contract Acta","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"gateways","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"actaAddr","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"}],"name":"revokeAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"pphrAddr","type":"address"}],"name":"newPPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnGateways","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"},{"internalType":"uint256","name":"nHours","type":"uint256"}],"name":"grantAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_id","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]';

export default class Permissions {
	//doc is an Object with the parameters id and pphrAddr -> {id,pphrAddr}
	constructor(doc) {
		this.id = doc["id"];
		this.nonce = 0;
		this.name = doc["name"];
		this.profileId = doc["profileId"];
		this.rights = Permissions.decode(doc["rights"]);
	}

	getAdded() {
		let addrs = [];
		for(let prop in this.rights) if(Object.prototype.hasOwnProperty.call(this.rights,prop)) {
			addrs.push(prop);
		}
		return addrs;
	}

	applyChanges(newStr, addr) {
		let prev = {};
		let now = {};

		for(let cat in this.rights[addr].categories.split(", ")) prev[cat] = true;
		for(let cat in newStr.split(", ")) now[cat] = true;

		for(let cat in validCats) {
			if(prev[cat] !== now[cat]) {
				if(prev[cat] === true && now[cat] !== true) revokeAccess(addr, cat);
				else if(prev[cat] !== true && now[cat] === true) grantAccess(addr, cat);
			}
		}

		this.rights[addr] = newStr;
	}

	//to which address, what sections and the name of the pphr
	grantAccess(addr, section) {
		let that = this;
		let profile = Profile.getProfileById(this.profileId).then((profile) => {
			let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
			let privateKey = new Buffer(profile.wallet.privKey, "hex");
			let mphr = new web3.eth.Contract(JSON.parse(mphrAbi));
			let data = mphr.methods.grantAccess(web3.utils.fromAscii(that.name).padEnd(66,'0'),addr,web3.utils.fromAscii(section).padEnd(66,'0'),0).encodeABI();

			let tx = new ethereumjs.Transaction({
				nonce: that.nonce,
				gasPrice: web3.utils.toHex(web3.utils.toWei("20","gwei")),
				gasLimit: 500000,
				to: profile.mphr,
				value: 0,
				data: data
			}, {'chain':'rinkeby'});

			tx.sign(privateKey);
			var raw = '0x'+tx.serialize().toString("hex");
			that.nonce++; //very important!

			try {
				web3.eth.sendSignedTransaction(raw, function(error,transactionHash) {
					if("Error",error) {
						console.log(error);
					} else {
						console.log("Revoke-Permission tx sent successfully:",transactionHash);
					}
				});
			} catch(error) {
				console.log(error);
			}
		});
		sleep(100);
	}

	revokeAccess(addr, section) {
		let that = this;
		let profile = Profile.getProfileById(this.patientId).then((profile) => {
			let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
			let privateKey = new Buffer(profile.wallet.privKey, "hex");
			let mphr = new web3.eth.Contract(JSON.parse(mphrAbi));
			let data = mphr.methods.revokeAccess(web3.utils.fromAscii(that.name).padEnd(66,'0'),addr,web3.utils.fromAscii(section).padEnd(66,'0')).encodeABI();

			let tx = new ethereumjs.Transaction({
				nonce: that.nonce,
				gasPrice: web3.utils.toHex(web3.utils.toWei("20","gwei")),
				gasLimit: 500000,
				to: profile.mphr,
				value: 0,
				data: data
			}, {'chain':'rinkeby'});

			tx.sign(privateKey);
			var raw = '0x'+tx.serialize().toString("hex");

			that.nonce++; //very important!

			web3.eth.sendSignedTransaction(raw, function(error,transactionHash) {
				if("Error",error) {
					console.log(error);
				}
				console.log("Revoke-Permission tx sent successfully:",transactionHash);
			});
		});
	}

	static encode(array) {
		let str = "";
		for(let i = 0; i < array.length; i++) {
			if(i > 0) str += "...";
			let el = array[i];
			let tstr = "";
			tstr += el["display"];
			tstr += ",,,";
			tstr += el["categories"];
			str += tstr;
		}
		return str;
	}

	static decode(str) {
		let array = [];
		let els = str.split("...");
		for(let i = 0; i < els.length; i++) {
			let el = els[i];
			let display = el.split(",,,")[0];
			let categories = el.split("...")[1];
			let obj = {
				"display": display,
				"categories": categories
			}
			array.push(obj);
		}
		return array;
	}

	toObject() {
		let rightsStr = Permissions.encode(this.rights);
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
		Permissions.store.remove({id:this.id});
	}

	update() {
		this.erase();
		this.save();
	}

}
