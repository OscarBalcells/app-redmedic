import React from 'react';
import { message, Menu, Icon, Layout } from 'antd';
const {  Header, Content, Footer, Sider } = Layout;

import ProfilesTab from "./contents/ProfilesTab.jsx";
import Profile from "./logic/Profile.js";
import Logo from "./contents/Logo.jsx";
import DocumentTab from "./contents/DocumentTab.jsx";
import PermissionsTab from "./contents/PermissionsTab.jsx";


export default class App extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				selected: 1,
				activeProfile: {},
				hasProfile: false,
			}
		}

		//select the first profile in list
		componentDidMount() {
			let profile = Profile.all().then((profiles) => {
				let id = profiles[0].id;
				this.changeProfile(id);
			});
		}

		changeProfile(id) {
			Profile.getProfileById(id).then((profile) => {
				this.setState({activeProfile:profile});
			});
		}

		//navigate menu tabs
		handleMenuClick(i) {
			this.setState({selected:i});
		}

		returnSelectedTab() {
			if(this.state.selected === 1) {
				return (<DocumentTab key={this.state.activeProfile.id} profile={this.state.activeProfile} />);
			} else if(this.state.selected === 2) {
				return (<PermissionsTab key={this.state.activeProfile.id} profile={this.state.activeProfile} />);
			} else if(this.state.selected === 3) {
				return (<ProfilesTab activateProfile={(id) => this.changeProfile(id)}/>);
			} else if(this.state.selected === 4) {
				return (<div>Busqueda todavia por acabar</div>);
			}
		}

    render() {
			if(this.state.activeProfile != null && this.state.activeProfile.hasOwnProperty("id") == false) {
				return(<div></div>);
			} else {
        return (
					<Layout>
						<Header>
							<div>
								<span className="redmedic"><b>RedMedic</b></span>
							</div>
						</Header>
            <Layout>
							<Sider style={{
								left:0,
								overflow:"auto",
								height:"100vh",
								position: "fixed"}}>
								<div className="logo" />
								<Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
									<Menu.Item key="1" id="menu-item1"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(1)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="file-text"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Documento</span>
										</div>
									</Menu.Item>

									<Menu.Item key="2" id="menu-item2"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(2)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="security-scan"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Permisos</span>
										</div>
									</Menu.Item>

									<Menu.Item key="3" id="menu-item3"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(3)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="user"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Perfiles</span>
										</div>
									</Menu.Item>

									<Menu.Item key="4" id="menu-item4"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(4)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="search"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Busqueda</span>
										</div>
									</Menu.Item>

								</Menu>
							</Sider>
							{this.returnSelectedTab()}
						</Layout>
					</Layout>
        );
    	}
		}
}
