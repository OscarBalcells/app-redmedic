import Wallet from "./Wallet.js";
import Database from "./Database.js";

var SimpleCrypto = require("simple-crypto-js").default;
var simpleCrypto = new SimpleCrypto("redmedic");


//this creates a class, which represents a profile
//this profile has some basic identifier data as well
//as the wallet attached to the profile
export default class Profile {
	constructor(data) {
		this.nombre = data["nombre"];
		this.primerNombre = this.nombre.split(" ")[0];
		this.fecha = data["fecha"];
		this.sexo = data["sexo"];
		this.id = data["id"];
		this.mnemonic = data["mnemonic"];
		this.mphr = data["mphr"];
		//creates the wallet, which is attached to the profile
		this.wallet = new Wallet(simpleCrypto.decrypt(this.mnemonic));
		this.foto = data["foto"] === null ? "" : data["foto"];
	}

	//Database helper functions for retrieving and storing profiles

	static get store() {
		if(!Profile.__store) {
			Profile.__store = new Database("profiles");
		}
		return Profile.__store;
	}

	static all() {
		return Profile.store.find({
			type: "perfil"
		}).then((docs) => {
			return docs.map(doc => new Profile(doc));
		});
	}

	static getProfileById(id) {
		return Profile.store.find({
			id: id
		}).then((docs) => {
			return docs.map(doc => new Profile(doc))[0];
		});
	}

	save() {
		return Profile.store.insert(this.toObject());
	}

	erase() {
		Profile.store.remove({id:this.id});
	}

	update() {
		this.erase();
		this.save();
	}

	//so we can store it in the nedb database
	toObject() {
		this.primerNombre = this.nombre.split(" ")[0];
		const obj = {
			nombre: this.nombre,
			primerNombre: this.primerNombre,
			foto: this.foto,
			fecha: this.fecha,
			sexo: this.sexo,
			id: this.id,
			foto: this.foto,
			mphr: this.mphr,
			mnemonic: this.mnemonic,
			type: "perfil",
		}
		return obj;
	}

}
