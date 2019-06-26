import React from "react";
import Wallet from "../logic/Wallet.js";
import Database from "../logic/Database.js";
import { Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

class AccountForm extends React.Component {

	state = {
		name: "",
		date: "",
		mnemonic: "",
	}

		handleSubmit(e) {
			console.log("Received");
			e.preventDefault();
			console.log(e);
		}

		render() {
			const {getFieldDecorator} = this.props.form;
			return (
				<Form onSubmit={(e) => this.handleSubmit(e)} className="login-form">
					<Form.Item>
						{getFieldDecorator("Nombre y Apellidos", {
							rules: [{ required: true, message:"Escribe tu nombre!"}]
						})(
							<Input
								prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="Oscar Balcells Obeso"
								value={this.state.name}
								onChange={(e) => this.setState({name:e.target.value})}
							/>
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator("Fecha de Nacimiento", {
							rules: [{ required: true, message:"Escribe tu fecha de nacimiento"}]
						})(
							<Input
								prefix={<Icon type="schedule" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="1/3/2002"
							/>
						)}
					</Form.Item>
				</Form>
			);
		}
}

const WrappedAccountForm = Form.create({name:"account-form"})(AccountForm);

class ContentPerfiles extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			perfiles : [],
			perfilSelected: 0,
			visible: false,
		}
		this.retrievePerfiles();
	}

	retrievePerfiles() {
		console.log("Retrieving profiles");
	}

	handleOK() {

	}

	savePerfil() {

	}

	removePerfil() {

	}

	createWallet() {
		const mnemonic = Wallet.generateMnemonic();
		const wallet = new Wallet("oscar",mnemonic);
		console.log("Wallet created!");
		console.log("Address is: " + wallet.address);
		return wallet;
	}

	static get store() {
			if (!Perfil.__store) {
				Perfil.__store = new Database("perfiles");
			}
			return Perfil.__store;
	}

	static all() {
			return Perfil.store.find({ type: "perfil" }).then((docs) => {
					return docs.map(doc => new Wallet(doc));
			});
	}

	render() {
		const formItemLayout = {
			labelCol: {span: 4},
			wrapperCol: { span: 14},
		}
		const buttonItemLayout = {
			wrapperCol: {span: 14, offset:4},
		}

		return(
			<Layout style={{marginLeft:200}}>
				<Header />
				<Content>
					<div className="tabs">
						Tabs
					</div>
					<div className="form">
						<Button type="primary" onClick={() => this.setState({visible: true})}> Add account</Button>
						<Modal
							title="Add Account"
							visible={this.state.visible}
							onOk={() => this.handleOK()}
							onCancel={() => this.setState({visible:false})}
						>
							<WrappedAccountForm />
						</Modal>
					</div>
				</Content>
				<Footer style={{textAlign:"center"}}>App RedMedic ©2019 Created by Oscar Balcells Obeso</Footer>
			</Layout>
		);
	}
}


export default ContentPerfiles;
