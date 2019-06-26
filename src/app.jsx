import React from 'react';
import { Menu, Icon, Layout } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import ContentPerfiles from "./contents/ContentPerfiles.jsx";

class App extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				selected: 1,
			}
		}

		 handleMenuClick(i) {
			this.setState({selected:i});
		}

		returnSelected() {
			if(this.state.selected === 2) {
				return (<ContentPerfiles />);
			} else {
				return (<h1>No perfil</h1>);
			}
		}

    render() {

        return (
            <Layout>
							<Sider style={{
								left:0,
								overflow:"auto",
								height:"100vh",
								position: "fixed"}}>
								<div className="logo" />
								<Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>

									<Menu.Item key="1" id="menu-item1"
									style={{height:"80px"}} onClick={() => this.handleMenuClick(1)}>
										<div style={{marginTop:"20px"}}>
											<Icon type="user"
											style={{fontSize:"25px"}}/>
											<span className="nav-text" style={{fontSize:"20px"}}>Perfil</span>
										</div>
									</Menu.Item>

									<Menu.Item key="2" id="menu-item2"
									style={{height:"80px"}} onClick={() => this.handleMenuClick(2)}>
										<div style={{marginTop:"20px"}}>
											<Icon type="video-camera"
											style={{fontSize:"25px"}}/>
											<span className="nav-text" style={{fontSize:"20px"}}>Documento</span>
										</div>
									</Menu.Item>

									<Menu.Item key="3" id="menu-item3"
									style={{height:"80px"}} onClick={() => this.handleMenuClick(3)}>
										<div style={{marginTop:"20px"}}>
											<Icon type="upload"
											style={{fontSize:"25px"}}/>
											<span className="nav-text" style={{fontSize:"20px"}}>Permisos</span>
										</div>
									</Menu.Item>

									<Menu.Item key="4" id="menu-item4"
									style={{height:"80px"}} onClick={() => this.handleMenuClick(4)}>
										<div style={{marginTop:"20px"}}>
											<Icon type="dollar"
											style={{fontSize:"25px"}}/>
											<span className="nav-text" style={{fontSize:"20px"}}>Balance</span>
										</div>
									</Menu.Item>

								</Menu>
							</Sider>
							{this.returnSelected()}
						</Layout>

        );
    }
}

//Every content component should have the following layour
// <Header style={{ background: '#fff', padding: 0 }} />
// <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
// 	<div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
// 		Contenido
// 	</div>
// </Content>

export default App;
