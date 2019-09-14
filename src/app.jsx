import React from 'react';
import { Menu, Icon, Layout } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import ProfilesTab from "./contents/ProfilesTab.jsx";
import Profile from "./logic/Profile.js";
import Logo from "./contents/Logo.jsx";
import DocumentTab from "./contents/DocumentTab.jsx";

export default class App extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				selected: 1,
				activeProfileId: " ",
			}
		}

		//select the first profile in list
		componentDidMount() {
			Profile.all().then((profiles) => {
				if(profiles.length > 0) {
					this.setState({activeProfileId:profiles[0].id});
				} else {
					console.log("No profiles!");
				}
			});
		}

		//navigate menu tabs
		handleMenuClick(i) {
			this.setState({selected:i});
		}

		returnSelectedTab() {
			if(this.state.selected === 2) {
				return (<ProfilesTab activateProfile={(id) => this.setState({activeProfileId:id})}/>);
			} else if(this.state.selected == 1) {
				if(this.state.activeProfileId !== " ") {
					return (<DocumentTab activeProfile={this.state.activeProfileId}/>);
				} else {
					return (<h1>Tienes que añadir un perfil para poder usar esta funcionalidad</h1>);
				}
			} else {
				return (<h1>{this.state.activeProfileName}</h1>);
			}
		}

    render() {
        return (
					<Layout>
						<Header>
							<div>
								<h1 style={{color:"white",display:"inline",float:"right"}}>{this.state.activeProfileName}</h1>
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
											<Icon type="user"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Perfiles</span>
										</div>
									</Menu.Item>

									<Menu.Item key="2" id="menu-item2"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(2)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="file-text"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Documento</span>
										</div>
									</Menu.Item>

									<Menu.Item key="3" id="menu-item3"
									style={{height:"50px"}} onClick={() => this.handleMenuClick(3)}>
										<div style={{marginTop:"5px"}}>
											<Icon type="dollar"
											style={{fontSize:"18px"}}/>
											<span className="nav-text" style={{fontSize:"15px"}}>Balance</span>
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
