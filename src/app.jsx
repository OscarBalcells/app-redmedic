import React from 'react';
import { Menu, Icon, Layout } from 'antd';
const { Header, Sider } = Layout;

import ProfilesTab from "./contents/ProfilesTab.jsx";
import Profile from "./logic/Profile.js";
import DocumentTab from "./contents/DocumentTab.jsx";
import PermissionsTab from "./contents/PermissionsTab.jsx";
import SearchTab from "./contents/SearchTab.jsx";
import EmergencyData from "./contents/EmergencyData.jsx";


export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: 1,
			activeProfile: {},
			hasProfile: false,
			hoverAmbulancia: false,
			hoverEnsayos: false
		}
	}

		//select the first profile in list
		componentDidMount() {
			Profile.all().then((profiles) => {
				let id = profiles[0].id;
				this.changeProfile(id);
			});
		}

		changeProfile(id) {
			Profile.getProfileById(id).then((profile) => {
				this.setState({activeProfile:profile});
			});
		}

		returnSelectedTab() {
			if(this.state.selected === 1) {
				return (<DocumentTab key={this.state.activeProfile.id} onlyProvider={""} profile={this.state.activeProfile} />);
			} else if(this.state.selected === 2) {
				return (<PermissionsTab key={this.state.activeProfile.id} profile={this.state.activeProfile} />);
			} else if(this.state.selected === 3) {
				return (<SearchTab profile={this.state.activeProfile} />);
			} else if(this.state.selected === 4) {
				return (<EmergencyData profile={this.state.activeProfile}/>);
			} else if(this.state.selected === 5) {
				return (<ProfilesTab activateProfile={(id) => this.changeProfile(id)}/>);
			}
		}

    render() {
		if(this.state.activeProfile != null && this.state.activeProfile.hasOwnProperty("id") == false) {
			return(<div>Loading...</div>);
		} else {
        	return (
					<Layout>
						<Header>
							<div>
								<span className="redmedic"><b>RedMedic</b></span>
								<span className="ackno"><span style={{marginRight:"15px"}}>Oscar Balcells - Jugend Forscht 2019/20 Wettbewerb</span><img style={{maxWidth:"40px",maxHeight:"40px"}} src="./images/jugend-forscht.jpg" /></span>
							</div>
						</Header>
            		<Layout>
							<Sider className="main-sider">
								<div className="logo" />
								<Menu theme="dark" mode="inline">
									<Menu.Item key="1" id="menu-item1"
									style={{height:"50px"}} onClick={() => this.setState({selected:1})}>
										<div style={{marginTop:"5px"}}>
											<Icon type="file-text"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Record</span>
										</div>
									</Menu.Item>
									<Menu.Item key="2" id="menu-item2"
									style={{height:"50px"}} onClick={() => this.setState({selected:2})}>
										<div style={{marginTop:"5px"}}>
											<Icon type="security-scan"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Permissions</span>
										</div>
									</Menu.Item>
									<Menu.Item key="3" id="menu-item3"
									style={{height:"50px"}} onClick={() => this.setState({selected:3})}>
										<div style={{marginTop:"5px"}}>
											<Icon type="search"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Search</span>
										</div>
									</Menu.Item>
									<Menu.Item key="4" id="menu-item4"
									style={{height:"50px"}} onClick={() => this.setState({selected:4})}>
										<div style={{marginTop:"5px"}}>
											<img src={"./images/ambulance"+(this.state.selected === 4 ? "-blanco" : "")+".png"} width="27px" height="27px"
											style={{marginLeft:"-7px",marginRight:"9px",marginBottom:"10px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Emergency</span>
										</div>
									</Menu.Item>
									<Menu.Item key="5" id="menu-item5"
									style={{height:"50px"}} onClick={() => this.setState({selected:5})}>
										<div style={{marginTop:"5px"}}>
											<Icon type="user"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Profiles</span>
										</div>
									</Menu.Item>
								</Menu>
								<div className="profile-card" onClick={() => this.setState({selected:4})}>
									<img className="profile-card-image" src={this.state.activeProfile.foto} />
									<span className="profile-card-name"><b>{this.state.activeProfile.nombre}</b></span>
								</div>
							</Sider>
							<div style={{marginLeft:"200px",width:"100vw"}}>
								{this.returnSelectedTab()}
							</div>
						</Layout>
					</Layout>
			);
		}	
	}
}
