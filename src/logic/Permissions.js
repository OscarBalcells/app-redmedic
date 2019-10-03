import Database from "./Database.js";
import Profile from "./Profile.js";

const Web3 = require("web3");
const ethereumjs = require("ethereumjs-tx");

let validCats = ["all","none","allergies","conditions","immunizations",
"labs","medications","procedures","images"];

//this creates a class, which represents a certain permission
//a permition is basically a mapping of addresses to specific access rights to -> [all, indf, temp]
//each permission is linked by the id of the patient and the address of the pphr
//permission_identifier = "id:pphrAddr"
//each permission is a list of objects
//the permissions object looks like this:
/*
permissions[id] = {
	addr1: {
		all": true/false;
		"indf": ["labs", "allergies", "conditions",...];
		"temp": [
			"procedures": "17-11-2019:16",
			"images": "19-11-2019:23",
		]
	},
	addr2: {
		all": true/false;
		"indf": ["labs", "allergies", "conditions",...];
		"temp": {
			"procedures": "17-11-2019:16",
			"images": "19-11-2019:23",
		}
	}
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
		this.patientId = doc["patientId"];
		this.pphrAddr = doc["pphrAddr"];
		this.id = this.patientId+":"+this.pphrAddr;
		this.addrs = Permissions.addrsStrToObject(doc["addrs"]);
		this.nonce = 0;
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

	static strToObject(_str) {
		//str is a string as represented in permissions container
		let str = "";
		for(let i = 0; i < _str.length; i++) { if(str[i] !== " ") str += _str[i]; }

		if(str.toLowerCase(str) !== "all" && str.toLowerCase(str) !== "none") {
			let elements = str.split(",");
			for(let el in elements) {
				let ind = el.indexOf("[");
				if(ind !== -1) {
					let date = el.slice(ind+1,el.length-1);
					let cat = el.slice(0,ind-1).toLowerCase();
					if(!(cat in validCats)) return undefined;
					if(date.indexOf(":") === -1) return undefined;
				} else {
					if(!(el in validCats)) { console.log(el); return undefined; }
				}
			}
		}

		let object;

		if(str === "all" || str === "All") {
			object = {
				"all": true,
				"indf": [],
				"temp": {}
			}
		} else if(str == "none" || str === "None") {
			object = {
				"all": false,
				"indf": [],
				"temp": {}
			}
		} else {
			let indfCats = [];
			let tempCats = [];
			let elements = str.split(",");
			for(let i = 0; i < elements.length; i++) {
				let el = elements[i];
				if(el[0] !== " ") indfCats.push(el);
				else indfCats.push(el.slice(1));
			}
			object = {
				"all": false,
				"indf": indfCats,
				"temp": tempCats
			}
		}
		return object;
	}

	//pass object to string
	static objectToStr(object) {
		if(object["all"] === true) {
			return "all";
		}

		let str = "";
		for(let i = 0; i < object["indf"].length; i++) { // in object["indf"].slice(1)) {
			if(i > 0) str += ", ";
			str += object["indf"][i];
		}

		if(str.length === 0) return "none";
		return str;
	}

	grantAccess(addr, section, name) {
		let that = this;
		let profile = Profile.getProfileById(this.patientId).then((profile) => {
			let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
			let privateKey = new Buffer(profile.wallet.privKey, "hex");
			let mphr = new web3.eth.Contract(JSON.parse(mphrAbi));
			let data = mphr.methods.grantAccess(web3.utils.fromAscii(name).padEnd(66,'0'),addr,web3.utils.fromAscii(section).padEnd(66,'0'),0).encodeABI();

			console.log("Using nonce:",that.nonce,"for tx");

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

			that.nonce++;

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

	revokeAccess(addr, section, name) {
		let that = this;
		let profile = Profile.getProfileById(this.patientId).then((profile) => {
			let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
			let privateKey = new Buffer(profile.wallet.privKey, "hex");
			let mphr = new web3.eth.Contract(JSON.parse(mphrAbi));
			let data = mphr.methods.revokeAccess(web3.utils.fromAscii(name).padEnd(66,'0'),addr,web3.utils.fromAscii(section).padEnd(66,'0')).encodeABI();

			console.log("Using nonce:",that.nonce,"for tx");

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

			that.nonce++;

			web3.eth.sendSignedTransaction(raw, function(error,transactionHash) {
				if("Error",error) {
					console.log(error);
				}
				console.log("Revoke-Permission tx sent successfully:",transactionHash);
			});
		});
	}

	applyChanges(prevObj, newObj, addr, name) {
		if(prevObj["all"] === false && newObj["all"] === true) {
			//grantFullAccess
			this.grantAccess(addr, "all", name);
		} else if(prevObj["all"] === true && newObj["all"] === false) {
			//revokeFulLAccess
			this.revokeAccess(addr, "all", name);
		}

		let map = {};
		for(let i = 0; i < prevObj["indf"].length; i++) {
			map[prevObj["indf"][i]] = true;
		}

		for(let i = 0; i < newObj["indf"].length; i++) {
			let el = newObj["indf"][i];
			if(map[el] == true) {}
			else if(map[el] !== true) {
				//grantAccess for cat=el
				this.grantAccess(addr, el, name);
			}
			map[el] = false;
		}

		for(let el in map) {
			if(map[el] == true) {
				//revokeAccess for cat=el
				this.revokeAccess(addr, el, name);
			}
		}
	}

	static addrsStrToObject(str) {
		let obj = {};
		if(str === "") return obj;
		let strSplit = str.split(".");
		for(let i = 0; i < strSplit.length; i++) {
			let el = strSplit[i];
			let addr = el.split(":")[0];
			let data = el.split(":")[1];
			obj[addr] = Permissions.strToObject(data);
		}
		return obj;
	}

	static addrsObjectToStr(obj) {
		let str = "";
		let first = true;
		for(let prop in obj) if(Object.prototype.hasOwnProperty.call(obj,prop)) {
			if(!first) str += ".";
			str += prop+":"+Permissions.objectToStr(obj[prop]);
			first = false;
		}
		return str;
	}

	//so we can store it in the nedb database
	toObject() {
		let addrs = Permissions.addrsObjectToStr(this.addrs);
		const obj = {
			patientId: this.patientId,
			pphrAddr: this.pphrAddr,
			id: this.id,
			addrs: addrs,
			type: "permissions"
		}
		return obj;
	}

}
