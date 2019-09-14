import React from "react";
import { message, Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

import Wallet from "../logic/Wallet.js";
import Profile from "../logic/Profile.js";

export default class DocumentTab extends React.Component {
	constructor(props) {
		super(props);
		this.profile = {
			nombre: "",
			id: "",
			wallet: {
				addr: "nada",
				privKey: "nada tampoco",
			}
		};
		this.requestAnswer = "";
		this.state = {
			fields: {
				ip: "",
				port: "",
				id: "",
				category: "",
			},
		};
	}

	fetchStuff(url) {
		return new Promise(function (resolve,reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onload = function() {
				var status = xhr.status;
				if(status == 200) {
					const response = JSON.parse(xhr.responseText);
					if(response.hasOwnProperty("ErrorMessage")) {
						reject(status);
					} else {
						resolve(response["data"]);
					}
				} else {
					reject(status);
				}
			};
			xhr.send();
		});
	}

	async queryData() {
		try {
			let sig = this.profile.wallet.signData("nonce");
			let url = "http://"+this.state.fields.ip+":"+this.state.fields.port+"/nonce/"+this.state.fields.id+"&"+sig;
			const nonce = await this.fetchStuff(url);

			const message = this.state.fields.id + "," + this.state.fields.category + "," + nonce.toString();
			sig = this.profile.wallet.signData(message);
			url = "http://"+this.state.fields.ip+":"+this.state.fields.port+"/patient/" + this.state.fields.id + "&" +
			this.state.fields.category + "&" + nonce + "&" + sig;
			const data = await this.fetchStuff(url);

			console.log("Data:",data);
			//Do something useful with data

		} catch (err) {
			console.log(err);
			message.error("An error ocurred:" + err)
		}
	}

	request() {
		this.queryData().then(function () {
			message.success("Data retrieved successfully");
		})
	}

	componentDidMount() {
		Profile.getProfileById(this.props.activeProfile).then((profile) => {
			this.profile = profile;
			this.setState({ state: this.state });
		});
	}

	changeField(e, field) {
		var fields = this.state.fields;
		fields[field] = e.target.value;
		this.setState({fields:fields});
	}

	render() {
		return (
			<Layout style={{height:"100vh",marginLeft:"205px"}}>
				<h1 style={{marginLeft:"10px",marginTop:"10px"}}>Hola, Vamos a probar la API</h1>
				<h1 style={{marginLeft:"10px",marginBottom:"10px"}}>
					Ahora mismo estas usando el perfil con:<br />
					Nombre:  <b>{this.profile.nombre}</b><br />
					Id:  <b>{this.profile.id}</b><br />
					Addr:  <b>{this.profile.wallet.addr}</b><br />
					PrivKey:  <b>{this.profile.wallet.privKey}</b>
				</h1>
				<Form style={{marginLeft:"10px"}}>
					<Form.Item label="Ip del punto de conexión del proveedor">
							<Input
								style={{width:"200px"}}
								prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="192.168.0.1"
								value={this.state.fields.ip}
								onChange={(e) => this.changeField(e, "ip")}
							/>
					</Form.Item>
					<Form.Item label="Puerto del punto de conexión del proveedor">
						<Input
							style={{width:"200px"}}
							prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
							placeholder="5555"
							value={this.state.fields.port}
							onChange={(e) => this.changeField(e, "port")}
						/>
					</Form.Item>
					<Form.Item label="Id del paciente a cuyo expediente quieres acceder">
						<Input
							style={{width:"200px"}}
							prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
							placeholder="123456789"
							value={this.state.fields.id}
							onChange={(e) => this.changeField(e, "id")}
						/>
					</Form.Item>
					<Form.Item label="Categoria a la que quieres acceder">
						<Input
							style={{width:"200px"}}
							prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
							placeholder="labs"
							value={this.state.fields.category}
							onChange={(e) => this.changeField(e, "category")}
						/>
					</Form.Item>
				</Form>
				<div>
					<Button
						style={{marginLeft:"10px",border:"1px solid #00B844",width:"200px",height:"30px",backgroundColor:"#00B844"}}
						type="primary" onClick={() => this.request()}>
						Enviar Request
					</Button>
				</div>
				<div style={{marginLeft:"10px",marginTop:"10px"}}>
					{this.requestAnswer}
				</div>
			</Layout>
		);
	}
}
