import React from "react";
import { Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

import Wallet from "../logic/Wallet.js";
import Profile from "../logic/Profile.js";

export default class DocumentTab extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Layout style={{marginLeft:"200px",height:"100vh"}}>
				<h1>Hello!</h1>
			</Layout>
		);
	}
}
