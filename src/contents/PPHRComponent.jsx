import React from "react";
import { Table, Divider, Tag, Popconfirm, essage, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

const Web3 = require("web3");

import Permissions from "../logic/Permissions.js";

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: text => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <span>
        <a>Invite {record.name}</a>
        <Divider type="vertical" />
        <a>Delete</a>
      </span>
    ),
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

class Addon extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shortProp: this.props.prop.slice(0,6)+"..."+this.props.prop.slice(-3)
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
		this.obj = {};
		this.columns = [
		  {
		    title: 'Name',
		    key: 'display',
		    render: text => <a>{text}</a>,
		  },
		  {
		    title: 'Address',
		    key: 'addr',
		  },
		  {
		    title: 'Permissions',
		    key: 'categories',
		    render: categories => (
		      <span>
		        {categories.map(cat => {
		          return (
		            <Tag color={'geekblue'} key={cat}>
		              {cat.toUpperCase()}
		            </Tag>
		          );
		        })}
		      </span>
		    ),
		  }
		];
		this.state = {
			data: [],
			visible: false,
			display: "",
			addr: "",
			data: ""
		}
	}

	//load all the permissions linked to this MPHR
	componentDidMount() {
		Permissions.getPermissionsById(this.props.addr).then(object => {
			let obj = object;
			if(obj === undefined) {
				let doc = {
					"id": this.props.addr,
					"name": this.providerName,
					"profileId": this.props.profile.id,
					"rights": ""
				}
				obj = new Permissions(doc);
				obj.save();
			}

			let data = [];
			for(let addr in obj.getAdded()) {
				data.push({
					"addr": addr,
					"display": obj.rights[addr].display,
					"categories": obj.rights[addr].categories
				});
			}
			this.setState({data:data});
			this.obj = obj;
		});
	}

	savePermissions() {
		let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
		web3.eth.getTransactionCount(this.props.profile.wallet.addr).then(nonce => {
			this.obj.nonce = nonce;

			for(let i = 0; i < this.state.data.length; i++) {
				let addr = this.state.data[i]["addr"];
				this.obj.applyChanges(this.state.data[i]["categories"], addr);
			}
			this.obj.update();
		});
	}

	/*
	changeField(prop, newVal) {
		let fields = this.state.fields;
		fields[prop] = newVal;
		this.setState({ fields:fields });
	}
	*/

	handleCancel() {
		this.setState({visible:false,addr:"",display:"",categories:""});
	}

	handleOk() {
		let data = this.state.data;
		data.push({
			"addr": this.state.addr,
			"display": this.state.display,
			"categories": this.state.fields.categories,
		});
		this.setState({data:data,addr:"",display:"",categories:""});
}

	renderAddrs() {
		return <Table columns={columns} dataSource={data} />;
	}

	render() {

		return (
			<div className="pphr-component">
				<div style={{marginLeft:"10px",marginTop:"5px"}}><b>{this.providerName}</b></div>
				<div style={{marginLeft:"5px",marginTop:"5px",marginRight:"10px",marginBottom:"8px"}}>{this.renderAddrs()}</div>
				<span style={{marginLeft:"690px"}}>
					<Button style={{float:"right"}} type="primary" shape="circle" onClick={() => this.setState({visible:true})} style={{backgroundColor:"#33cc33",border:"0px"}}><Icon type="plus" /></Button>
					<div style={{display:"inline-block",width:"3px"}}></div>
					<Button style={{float:"right"}} type="primary" onClick={() => this.savePermissions()} style={{backgroundColor:"#1a66ff",border:"0px",}}><Icon type="save" theme="filled"/></Button>
				</span>

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
									value={this.state.display}
									onChange={(e) => this.setState({display:e.target.value})}
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
									value={this.state.data}
									onChange={(e) => this.setState({data:e.target.value})}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		)
	}
}
