import React from "react";
import { Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

import Wallet from "../logic/Wallet.js";
import Profile from "../logic/Profile.js";

import ProfileContent from "./ProfileContent.jsx";
import NewProfileForm from "./NewProfileForm.jsx";

var SimpleCrypto = require("simple-crypto-js").default;
var simpleCrypto = new SimpleCrypto("redmedic");

//in this tab, the user will be able to view and activate all the available profiles, as well
//as creating a new one and using an existing mnemonic seed phrase or creating it from scratch
export default class ProfilesTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			resetValues: false,
			visible: false,
			profiles: [],
			selected: 1
		}
	}

	componentDidMount() {
		this.retrieveProfiles();
		this.setState({ mounted:true });
	}

	retrieveProfiles() {
		Profile.all().then((profiles) => {
			let storeProfiles = profiles.map((profile) =>
				[profile.id, profile.primerNombre]
			);
			this.setState({profiles:storeProfiles});
		})
	}

	//the form has been submitted with all the necessary data
	profileCreated(fields) {
		this.setState({visible:false,resetValues:true});
		fields["mnemonic"] = simpleCrypto.encrypt(fields["mnemonic"]);
		const newProfile = new Profile(fields);
		newProfile.save();
		this.retrieveProfiles();
	}

	//form helper functions -> hide or show
	endForm() { this.setState({visible:false,resetValues:true}); }
	startForm() { this.setState({visible:true,resetValues:false}); }

	//returns an array of all the available profiles so that the user can
	//navigate through all of them
	returnProfileTabs() {
		let tabs = this.state.profiles.map((profile) =>
			<Tabs.TabPane key={profile[0]} tab={<span>{profile[1]}</span>} >
				<ProfileContent id={profile[0]} activateProfile={(id) => this.props.activateProfile(id)} newProfile={() => this.startForm()} />
			</Tabs.TabPane>
		);
		return tabs;
	}

	render() {
		var addButton = "";
		return(
			<Layout style={{marginLeft:"200px",height:"100vh"}}>
				{addButton}
				<Tabs defaultActiveKey="2" style={{ padding: "16px", height:"100vh" }}>
					{this.returnProfileTabs()}
				</Tabs>
				<Modal
					visible={this.state.visible}
					onCancel={() => this.endForm()}
					footer={[]}
				>
					<NewProfileForm onSubmit={(fields) => this.profileCreated(fields)} resetValues={this.state.resetValues}/>
				</Modal>
				<Footer style={{height:"0px"}} />
			</Layout>
		);
	}
}
