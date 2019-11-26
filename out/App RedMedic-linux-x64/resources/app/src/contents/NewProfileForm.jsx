import React from "react";
import Wallet from "../logic/Wallet.js"
import { Button, Icon, Form, Input, Radio } from 'antd';
var SimpleCrypto = require("simple-crypto-js").default;
var simpleCrypto = new SimpleCrypto("redmedic");

export default class NewProfileForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			phase: 1,
			nombre: "",
			fecha: "",
			sexo: "",
			id: "",
			mnemonic: "",
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit(this.state);
	}

	componentDidUpdate(prevProps) {
		if(this.props.resetValues && !prevProps.resetValues) {
			this.setState({
				phase: 1,
				nombre:"",
				fecha:"",
				sexo:"",
				id:"",
				mnemonic:"",
			})
		}
	}

	render() {
		if(this.state.phase === 1) {
				return (
					<div>
						<div>
							<h2>Mnemonic Code</h2>
							<p>
								If you don't have an account in the RedMedic network yet, click the button to generate
								12 random seed words, which will be used to derive your cryptographic private key and
								verify your identity in the RedMedic network.
								<b> Don't write these words yourself. </b>
								In case you already own a valid crypto wallet in the form of a
								hierarchichal deterministic key set by the standard of BIP-0032,
								just write your 12 seed words down.
							</p>
							<p style={{color:"red"}}>
								This cryptographic private key will be used to verify your identity in the RedMedic network.
								If someone gains access to this key it may compromise the security and integrity of your data.
								Please, write it down and store it in a safe place.
							</p>

							<Button type="primary" onClick={() => this.setState({mnemonic:Wallet.generateMnemonic()})}>Generate Seed</Button>
							<Input.TextArea
								style={{marginTop:"5px",marginBottom:"10px"}}
								value={this.state.mnemonic}
								onChange={(e) => this.setState({mnemonic:e.target.value})}
							/>
						</div>
						<Button type="danger" style={{float:"right"}} onClick={() => this.setState({phase:2})}>Accept</Button>
					</div>
				);
		} else {
			return(
				<Form onSubmit={(e) => this.handleSubmit(e)}>
					<Form.Item label="Name and Surname">
							<Input
								prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="Oscar Balcells Obeso"
								value={this.state.nombre}
								onChange={(e) => this.setState({nombre:e.target.value})}
							/>
					</Form.Item>
					<Form.Item label="Date of Birth">
						<Input
								prefix={<Icon type="calendar" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="01/03/2002"
								value={this.state.fecha}
								onChange={(e) => this.setState({fecha:e.target.value})}
						/>
					</Form.Item>
					<Form.Item label="Sex">
						<Radio.Group onChange={(e) => this.setState({sexo:e.target.value})} value={this.state.sexo}>
							<Radio value={"Mujer"}>Female</Radio>
							<Radio value={"Hombre"}>Male</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label="ID Seguridad social">
						<Input
							prefix={<Icon type="idcard" style={{color:"rgba(0,0,0,.25)"}} />}
							placeholder={"123456789"}
							value={this.state.id}
							onChange={(e) => this.setState({id:e.target.value})}
						/>
					</Form.Item>
					<Button style={{float:"right"}} type="primary" htmlType="submit">Add Account</Button>
				</Form>
			);
		}
	}
}
