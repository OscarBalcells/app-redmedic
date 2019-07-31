import React from "react";
import Wallet from "../logic/Wallet.js";
import Database from "../logic/Database.js";
import Perfil from "../logic/Perfil.js";
import ContentPerfil from "./ContentPerfil.jsx";
import AccountForm from "./AccountForm.jsx";
import { Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;


class ContentPerfiles extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			resetValues: false,
			visible: false,
			perfiles: [],
			seleccionado: 1,
		}
	}

	componentDidMount() {
		Perfil.all().then((perfiles) => {
			let guardarPerfiles = perfiles.map((perfil) =>
				[perfil.id, perfil.primerNombre]
			);
			console.log("Perfiles restaurados", guardarPerfiles);
			this.setState({perfiles:guardarPerfiles});
		})
	}

	accountCreated(fields) {
		this.setState({visible:false,resetValues:true});
		const nuevoPerfil = new Perfil(fields);
		nuevoPerfil.save();
		const guardarPerfil = [nuevoPerfil.id, nuevoPerfil.primerNombre];
		console.log("Nuevo perfil creado y guardado! ", fields);
		this.setState({perfiles:this.state.perfiles.concat(guardarPerfil)})
	}

	accountCanceled() {
		this.setState({visible:false,resetValues:true});
	}

	returnTabs() {
		let tabs = this.state.perfiles.map(perfil =>
			<Tabs.TabPane key={perfil[0]} tab={<span>{perfil[1]}</span>}>
				<ContentPerfil id={perfil[0]} />
			</Tabs.TabPane>
		);
		return (tabs);
	}


	render() {
		return(
			<Layout style={{marginLeft:"200px"}}>
				<Tabs defaultActiveKey="2" style={{ padding: "16px" }}>
					{this.returnTabs()}
				</Tabs>
				<Button type="primary" color="red" onClick={() => {this.setState({resetValues:false,visible:true})}}>Add Account</Button>
				<Modal
					visible={this.state.visible}
					onCancel={() => this.accountCanceled()}
					footer={[]}
				>
					<AccountForm onSubmit={(fields) => this.accountCreated(fields)} resetValues={this.state.resetValues}/>
				</Modal>
			</Layout>
		);
	}
}

export default ContentPerfiles;
