import React from "react";
import DocumentTab from "./DocumentTab.jsx";
import PPHRComponent from "./PPHRComponent.jsx";
const Web3 = require("web3");
const { mphrABI, ProviderNames } = require("../logic/Settings.js");
import { Layout } from "antd";

export default class PermissionsTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			providers: [],
			view: "all",
		}
	}

	componentDidMount() {
		this.queryAddresses();
	}

	queryAddresses() {
		var that = this;

		let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
		if(web3.eth.getCode(this.props.profile.mphr) == '0x0' || web3.eth.getCode(this.props.profile.mphr) == '0x') {
			console.log("Nothing at address");
			return;
		}

		let mphr = new web3.eth.Contract(JSON.parse(mphrABI));
		mphr.options.address = this.props.profile.mphr;

		for(var i = 0; i < ProviderNames.length; i++) {
			let pn = ProviderNames[i];
			mphr.methods.getPPHR(web3.utils.fromAscii(pn)).call({}, function (error, result) {
				if(error) {
					throw (error);
				}
				let pphrAddr = result[1];
				var hex = result[2].toString();//force conversion
				var pphrGateway = '';
				for (var j = 0; (j < hex.length && hex.substr(j, 2) !== '00'); j += 2)
					pphrGateway += String.fromCharCode(parseInt(hex.substr(j, 2), 16));
				pphrGateway = pphrGateway.slice(1);
				that.setState({providers:that.state.providers.concat({pphrAddr,pphrGateway})});
			});
		}
	}

	returnPPHRs() {
		if(this.state.view !== "all") {
			return <DocumentTab profile={this.props.profile} onlyProvider={this.state.view} changeView={() => this.setState({view:"all"})} />
		}
		return this.state.providers.map((provider) => {
			let providerName = (provider.pphrGateway === "0.0.0.0:5000" ? "Corachan" : (provider.pphrGateway === "0.0.0.0:5001" ? "Pilar" : "Teknon"));
			return <PPHRComponent key={provider["pphrAddr"]} changeView={() => this.setState({view:providerName})} addr={provider["pphrAddr"]} providerName={providerName} profile={this.props.profile} />
		});
	}

	render() {
		//a container is this horizontal div showing the permissions for a particular pphr
		if(this.state.providers.length === 0) {
			return (<div style={{marginLeft:"40vw",marginTop:"250px"}} className="lds-ripple"><div></div><div></div></div>);
		}
		return (
			<Layout style={{padding:"30px"}}>
				{this.returnPPHRs()}
			</Layout>
		);
	}
}
