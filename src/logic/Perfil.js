import Wallet from "./Wallet.js";
import Database from "./Database.js"

class Perfil {

	constructor(datos) {
		this.nombre = datos["nombre"];
		this.primerNombre = "";
		for(var i = 0; i < this.nombre.length; i++) {
			if(this.nombre[i] == " ") break;
			this.primerNombre += this.nombre[i];
		}
		this.fecha = datos["fecha"];
		this.sexo = datos["sexo"];

		this.id = datos["id"];
		this.mnemonic = datos["mnemonic"];
		this.wallet = new Wallet(this.nombre, this.mnemonic);
		this.foto = "";
	}

	static get store() {
		if(!Perfil.__store) {
			Perfil.__store = new Database("perfiles");
		}
		return Perfil.__store;
	}

	static all() {
		return Perfil.store.find({
			type: "perfil"
		}).then((docs) => {
			return docs.map(doc => new Perfil(doc));
		});
	}

	static getPerfilById(id) {
		return Perfil.store.find({
			id: id
		}).then((docs) => {
			return docs.map(doc => new Perfil(doc))[0];
		});
	}

	save() {
		return Perfil.store.insert(this.toObject());
	}

	erase() {
		Perfil.store.remove({ id: this.id});
	}

	update() {
		this.erase();
		this.save();
	}

	toObject() {
		const obj = {
			nombre: this.nombre,
			primerNombre: this.primerNombre,
			foto: this.foto,
			fecha: this.fecha,
			sexo: this.sexo,
			id: this.id,
			mnemonic: this.mnemonic,
			type: "perfil",
		}
		return obj;
	}

}

export default Perfil;
