import React from "react";
import { PageHeader, Table, Divider, Tag, Popconfirm, essage, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

const Web3 = require("web3");

let colorCats = {
	"allergies": "geekblue",
	"labs":"red",
	"procedures":"volcano",
	"immunizations":"cyan",
	"medications":"magenta",
	 "conditions":"purple",
	 "images":"green",
	 "all":"lime"
}

import Permissions from "../logic/Permissions.js";


//props => key={provider["pphrAddr"]} addr={provider["pphrAddr"]} gateway={provider["pphrGateway"]} profile={this.props.profile}
export default class PPHRComponent extends React.Component {
	constructor(props) {
		super(props);
		this.obj = {};
		this.columns = [
		  {
		    title: 'Name',
		    key: 'name',
				dataIndex: "name",
		    render: text => <a>{text}</a>,
		  },
		  {
		    title: 'Address',
				dataIndex: "addr",
		    key: 'addr',
				render: (addr) => (
					<p style={{fontSize:"10px"}}>
						{addr}
					</p>
				),
		  },
		  {
		    title: 'Categories',
				dataIndex: "categories",
		    key: 'categories',
		    render: (categories, record) => (
					<span>
						{categories.map(cat => {
							if(record.editing === true) {
								return <Input value={cat} onChange={(e) => this.changeCats(e.target.value, record.key)} />
							} else {
								return (
									<Tag color={colorCats[cat]} key={cat}>
										{cat}
									</Tag>
								);
							}
						})}
					</span>
				),
			},
			{
		    title: 'Action',
		    key: 'action',
		    render: (text, record) => (
		      <span>
		        <a onClick={() => this.toggleEdit(record.key)}>{(record.editing === true ? "Save" : "Edit")}</a>
		        <Divider type="vertical" />
		        <a onClick={() => this.deleteElement(record.key)}>Delete</a>
		      </span>
		    ),
		  },
		];
		this.state = {
			data: [],
			visible: false,
			name: "",
			addr: "",
			categories: "",
		}
	}

	//load all the permissions linked to this MPHR
	componentDidMount() {
		Permissions.getPermissionsById(this.props.addr).then(object => {
			let obj = object;

			if(obj === undefined) {
				let doc = {
					"id": this.props.addr,
					"name": this.props.providerName,
					"profileId": this.props.profile.id,
					"rights": ""
				}
				obj = new Permissions(doc);
				obj.update();
			}

			let data = [];
			let addrs = obj.getAdded();

			for(let i = 0; i < addrs.length; i++) {
				let addr = addrs[i];
				data.push({
					"addr": addr,
					"name": obj.rights[addr].display,
					"categories": obj.rights[addr].categories,
					"editing": false,
					"deleted": false,
				});
			}
			this.setState({data:data});
			this.obj = obj;
		});
	}

	save(ind) {
		if(this.state.data[ind].deleted === true) return;
		let addr = this.state.data[ind].addr;
		this.obj.applyChanges(this.state.data[ind]["categories"], addr);
	}

	handleCancel() {
		this.setState({visible:false,addr:"",name:"",categories:""});
	}

	handleOk() {
		let data = this.state.data;
		data.push({
			"addr": this.state.addr,
			"name": this.state.name,
			"categories": this.state.categories,
			"editing": false,
			"deleted": false,
		});
		this.obj.newElement(this.state.addr, this.state.name, this.state.categories);
		this.setState({visible:false,data:data,addr:"",name:"",categories:""});
	}

	changeCats(newVal, ind) {
		if(this.state.data[ind].deleted === true) return;
		let data = this.state.data;
		data[ind].categories = newVal;
		this.setState({data:data});
	}


	deleteElement(ind) {
		if(this.state.data[ind].deleted === true) console.log("Already deleted",ind);
		this.obj.deleteElement(this.state.data[ind].addr);
		let data = this.state.data;
		data[ind].deleted = true;
		this.setState({data:data});
	}

	toggleEdit(ind) {
		if(this.state.data[ind].deleted === true) return;
		let data = this.state.data;
		data[ind].editing = (data[ind].editing === true ? false : true);
		this.setState({data:data});
		if(data[ind].editing === false) this.save(ind);
	}

	renderData() {
		let cnt = -1;
		if(this.state.data.length === 0) return <div></div>;
		let data = [];
		this.state.data.map(obj => {
			if(obj.deleted === false) {
				cnt += 1;
				let cats = (obj.editing === true ? [obj.categories] : obj.categories.split(", "));
				data.push({
					"key": cnt,
					"name": obj.name,
					"addr": obj.addr,
					"categories": cats,
					"editing": obj.editing,
				});
			}
		});
		return <Table columns={this.columns} dataSource={data} />;
	}

	render() {
		return (
			<div className="pphr-component" style={{marginLeft:"210px"}}>
				<span className="provider-name"><a onClick={() => this.props.changeView()}>{this.props.providerName}</a></span>
				<Button className="add-button" type="primary" shape="circle" onClick={() => this.setState({visible:true})}><Icon type="plus" /></Button>
				<div style={{marginLeft:"10px",marginTop:"5px",marginRight:"10px",marginBottom:"8px"}}>{this.renderData()}</div>
				<div style={{width:"100%",height:"5px"}}></div>
				<Modal
					visible={this.state.visible}
					title="New Address"
					onOk={() => this.handleOk()}
					onCancel={() => this.handleCancel()}>
					<Form>
						<Form.Item label="Display">
								<Input
									prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="Medical Researcher at UB Lab"
									value={this.state.name}
									onChange={(e) => this.setState({name:e.target.value})}
								/>
						</Form.Item>
						<Form.Item label="Address">
								<Input
									prefix={<Icon type="qrcode" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="0x23702ecb660A2b10e6D1c47c6ECbC8F410980f56"
									value={this.state.addr}
									onChange={(e) => this.setState({addr:e.target.value})}
								/>
						</Form.Item>
						<Form.Item label="Permissions">
							<Input
									prefix={<Icon type="unlock" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="allergies, labs, conditions, images"
									value={this.state.categories}
									onChange={(e) => this.setState({categories:e.target.value})}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		)
	}
}
