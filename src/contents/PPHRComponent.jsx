import React from "react";
import { message, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

const Web3 = require("web3");

import Permissions from "../logic/Permissions.js";

let cnt = 0;

/*
this.patientId = doc["patientId"];
this.pphrAddr = doc["pphrAddr"];
this.id = this.patientId+":"+this.pphrAddr;
this.addrs = (doc["addrs"] !== undefined ? doc["addrs"] : []);
*/

class Addon extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shortProp: this.props.prop
		};
	}

	click() {
		if(this.state.shortProp.length <= 12) this.setState({shortProp:this.props.prop});
		else this.setState({shortProp:this.props.prop.slice(0,6)+"..."+this.props.prop.slice(-3)});
	}

	render() {
		return (
			<div style={{cursor:"pointer"}} onClick={(e) => this.click()} >
				{this.state.shortProp}
			</div>
		);
	}
}

//props => key={provider["pphrAddr"]} addr={provider["pphrAddr"]} gateway={provider["pphrGateway"]} profile={this.props.profile}
export default class PPHRComponent extends React.Component {
	constructor(props) {
		super(props);
		this.providerName = (this.props.gateway === "0.0.0.0:5000" ? "Corachan" : (this.props.gateway === "0.0.0.0:5001" ? "Pilar" : "Teknon"));
		this.state = {
			permissions: {},//permisssions object
			fields: {},
			previousFields: {}, //needed to compare between fields differences
			visible: true,
			addr: "",
			data: "",
		}
	}

	componentDidMount() {
		Permissions.getPermissionsById(this.props.profile.id+":"+this.props.addr).then(permissions => {
			let newPermissions = permissions;
			console.log("np",newPermissions);
			if(newPermissions === undefined) {
				let permissionsDoc = {
					"patientId": this.props.profile.id,
					"pphrAddr": this.props.addr,
					"addrs": ""
				}
				newPermissions = new Permissions(permissionsDoc);
				newPermissions.save();
			}
			this.setState({ permissions:newPermissions });

			let fields = {};
			for(let prop in this.state.permissions.addrs) {
				if(Object.prototype.hasOwnProperty.call(this.state.permissions.addrs,prop)) {
					fields[prop] = Permissions.objectToStr(this.state.permissions.addrs[prop]);
				}
			}
			this.setState({previousFields:fields,fields:fields});
		});
	}

	savePermissions() {
		//iterate through all fields
		let newAddrs = this.state.permissions.addrs;
		let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
		web3.eth.getTransactionCount(this.props.profile.wallet.addr).then(nonce => {
			this.state.permissions.nonce = nonce;

			for(let prop in this.state.fields) if(Object.prototype.hasOwnProperty.call(this.state.fields,prop)) {
				this.state.permissions.applyChanges(this.state.permissions.addrs[prop],Permissions.strToObject(this.state.fields[prop]), "0x13BC6151B769d05e10bAF240d276976708077843", this.providerName);
				newAddrs[prop] = Permissions.strToObject(this.state.fields[prop]);
			}

			let newPermissions = this.state.permissions;
			newPermissions["addrs"] = newAddrs;
			this.setState({previousFields:this.state.fields,permissions:newPermissions});
			this.state.permissions.update();
		});
	}

	changeField(prop, newVal) {
		let fields = this.state.fields;
		fields[prop] = newVal;
		this.setState({ fields:fields });
	}

	addAddr() {
		let previousFields = this.state.previousFields;
		let fields = this.state.fields;
		let newAddr = "0x0123456789"+cnt.toString();
		let newAddrAtPermissions = this.state.permissions;

		newAddrAtPermissions["addrs"][newAddr] = {
			"all": false,
			"indf": [],
			"temp": {}
		}
		fields[newAddr] = "none";
		previousFields[newAddr] = "none"; //must be set to none

		this.setState({permissions:newAddrAtPermissions,previousFields:previousFields,fields:fields})
		cnt++;
	}

	handleCancel() {
		this.setState({visible:false,addr:"",data:""});
	}

	handleOk() {
		this.setState({visible:false});
	}

	renderAddrs() {
		let addrs = [];
		for(let prop in this.state.fields) if(Object.prototype.hasOwnProperty.call(this.state.fields,prop)) {
			let addon = <Addon prop={prop} />
			addrs.push(
				<Input key={prop} addonBefore={addon} value={this.state.fields[prop]} onChange={(e) => this.changeField(prop,e.target.value)} />
			);
		}
		return addrs;
	}

	render() {
		let providerName = "";
		if(this.props.gateway === "0.0.0.0:5000") providerName = "Corachan";
		else if(this.props.gateway === "0.0.0.0:5001") providerName = "Pilar";
		else providerName = "Teknon";

		return (
			<div style={{border:"1px solid grey",marginTop:"15px",marginLeft:"5px",marginRight:"10px",borderRadius:"1px"}}>
				<div style={{marginLeft:"10px",marginTop:"5px"}}><b> Your data at {providerName}'s database <a href="#">{this.props.addr}</a>:</b></div>
				<div style={{marginLeft:"5px",marginTop:"5px",marginRight:"10px",marginBottom:"8px"}}>{this.renderAddrs()}</div>
				<span style={{marginLeft:"690px"}}>
					<Button style={{float:"right"}} type="primary" shape="circle" onClick={() => this.addAddr()} style={{backgroundColor:"#33cc33",border:"0px"}}><Icon type="plus" /></Button>
					<div style={{display:"inline-block",width:"3px"}}></div>
					<Button style={{float:"right"}} type="primary" onClick={() => this.savePermissions()} style={{backgroundColor:"#1a66ff",border:"0px",}}><Icon type="save" theme="filled"/></Button>
				</span>
				<div style={{width:"100%",height:"5px"}}></div>
				<Modal
					visible={this.state.visible}
					title="New Address"
					onOk={(e) => this.handleOk(e)}
					onCancel={() => this.handleCancel()}>
					Hola a todos
					Me llamo Oskar
				</Modal>
			</div>
		)
	}
}
