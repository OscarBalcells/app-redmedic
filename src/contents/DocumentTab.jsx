import React from "react";
import { message, Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

import Wallet from "../logic/Wallet.js";
import Profile from "../logic/Profile.js";
import RecordSection from "./RecordSection.jsx";
import Logo from "./Logo.jsx";

const Web3 = require("web3");

var categories = ["allergies", "labs", "procedures", "immunizations", "medications", "conditions", "images"];
var possibleDates = ["performedDatePeriod","performedPeriod","recordedDate", "date", "dateRecorded",
"effectiveDateTime", "effectiveTimeDate", "dateWritten",
"performedDateTime"];

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function compare(resourceA, resourceB) {
	let a = resourceA["date"];
	let b = resourceB["date"];
	let d = a.split("-")[0];
	let m = a.split("-")[1];
	let y = a.split("-")[2];
	let totalDaysA = parseInt(d) + parseInt(m)*30 + parseInt(y)*365;
	d = b.split("-")[0];
	m = b.split("-")[1];
	y = b.split("-")[2];
	let totalDaysB = parseInt(d) + parseInt(m)*30 + parseInt(y)*365;
	return (totalDaysA < totalDaysB ? 1 : -1);
}

function getDate(resource) {
	for(var i = 0; i < possibleDates.length; i++) {
		if(resource.hasOwnProperty(possibleDates[i])) {
			let date = null;
			if(i <= 1) { date = resource[possibleDates[i]]["end"]; }
			else { date = resource[possibleDates[i]]; }
			let d = date.split("-")[0];
			if(d.length == 1) { d = "0"+d; }
			let m = date.split("-")[1];
			if(m.length == 1) { m = "0"+m; }
			let y = date.split("-")[2].slice(0,4);
			return d+"-"+m+"-"+y;
		}
	}
}

function getSummary(resource) {
	let type = resource.resourceType;
	if(type === "AllergyIntolerance") return resource.substance+"  -  "+resource.status;
	else if(type === "Condition") return resource.code.coding[0].display+"  -  "+resource.clinicalStatus;
	else if(type === "Immunization") return resource.vaccineCode.text+"  -  "+resource.status;
	else if(type === "Observation") return resource.code.text+"  -  "+resource.valueQuantity.value+" "+resource.valueQuantity.unit;
	else if(type === "MedicationOrder") return resource.medicationReference;
	else if(type === "Procedure") return resource.code.text+"  -  "+resource.status;
	else if(type === "Images") return resource.notes;
}

const mphrAbi = '[{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"deletePPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"getPPHR","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"acta","outputs":[{"internalType":"contract Acta","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"gateways","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"actaAddr","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"}],"name":"revokeAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"pphrAddr","type":"address"}],"name":"newPPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnGateways","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"},{"internalType":"uint256","name":"nHours","type":"uint256"}],"name":"grantAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_id","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]';

export default class DocumentTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			view: "all",
			personalData: {},
			labs: [],
			medications: [],
			allergies: [],
			procedures: [],
			immunizations: [],
			conditions: [],
			images: []
		};
	}

	componentDidMount() {
		this.getData();
	}

	addData(data, gateway) {
		let provider = "";
		//manually identify providers
		if(gateway == "0.0.0.0:5000") { provider = "Clínica Corachan"; }
		else if(gateway == "0.0.0.0:5001") { provider = "Hospital el Pilar"; }
		else if(gateway == "0.0.0.0:5002") { provider = "Centro Médico Teknon" }
		var that = this;

		categories.forEach(function (category) {
			let list = [];
			for(let i = 0; i < data[category].length; i++) {
				let resource = data[category][i];
				resource["provider"] = provider;
				resource["date"] = getDate(resource);
				resource["summary"] = getSummary(resource);
				list.push(resource);
			}
			//we sort by dates
			let newState = that.state;
			newState[category] = newState[category].concat(list);
			newState[category].sort(compare);
			that.setState({ state:newState });
		});

		if(this.state.personalData.hasOwnProperty("display") === false) {
			this.setState({personalData:data["personalData"]});
		}

		console.log("Data successfully fetched from gateway "+ gateway);
	}

	fetchUrl(url) {
		return new Promise(function (resolve,reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onload = function() {
				var status = xhr.status;
				if(status > 400 || status == 200) {
					const response = JSON.parse(xhr.responseText);
					if(status != 200 || response.hasOwnProperty("ErrorMessage")) {
						message.error("An error ocurred when querying url: "+ url + ", error response is: " + response["ErrorMessage"]);
						reject(status);
					} else {
						resolve(response["data"]);
					}
				} else { //Unknown error
					reject(status);
				}
			};
			xhr.send();
		});
	}

  //returns 0 if everything ok, else returns 1
	async request(gateway, id, category) {
		try {
			let sig = this.props.profile.wallet.signData("nonce");
			let url = "http://"+gateway+"/nonce/"+id+"&"+sig;
			const nonce = await this.fetchUrl(url);

			const message = id + "," + category + "," + nonce.toString();
			sig = this.props.profile.wallet.signData(message);
			url = "http://"+gateway+"/patient/"+id+"&"+category+"&"+nonce+"&"+sig;
			const data = await this.fetchUrl(url);
			this.addData(data, gateway);
		} catch(exception) {
			console.log("Exception ocurred:", exception);
		}
	}

	//returns all the data from every single pphr
	async getData() {
		//first we have to find out all the gateways we have to query
		var that = this;
		let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
		if(web3.eth.getCode(this.props.profile.mphr) == '0x0' && web3.eth.getCode(this.props.profile.mphr) == '0x') {
			console.log("Nothing at address");
			return;
		}
		let mphr = new web3.eth.Contract(JSON.parse(mphrAbi));
		mphr.options.address = this.props.profile.mphr;

		let gateways = [];
		mphr.methods.returnGateways().call({}, function (error, result) {
			if(error) {
				throw (error);
			}
			for(var i = 0; i < result.length; i++) {
				let gateway = hex2a(result[i]).slice(1);
				that.request(gateway, that.props.profile.id, "all");
			}
		});
	}

	returnContent() {
		if(this.state.view === "all") {
			var sections = [];
			var last = 0;

			for(var i = 0; i < categories.length; i++) {
				let cat = categories[i];
				if(this.state[cat].length !== 0) last = i;
			}

			for(var i = 0; i <= last; i++) {
				let cat = categories[i];
				if(this.state[cat].length === 0) continue;
				sections.push(
					<RecordSection key={cat} marginBottom={(i === last ? "80px" : "0px")} section={cat} data={this.state[cat]} individual={false} changeView={(newView) => this.setState({view:newView})} />
				);
			}
			return sections;
		} else {
			let cat = this.state.view;
			if(categories.indexOf(cat) !== -1) {
				return (<RecordSection section={cat} data={this.state[cat]} individual={true} changeView={(newView) => this.setState({view:newView})} />);
			} else {
				return (<div>Full record only!</div>);
			}
		}
	}

	render() {
		//not until we have data
		if(this.state.personalData.hasOwnProperty("display") === false) {
			return (<div style={{marginLeft:"210px"}}><div style={{marginLeft:"350px",marginTop:"250px"}} className="lds-ripple"><div></div><div></div></div></div>);
		}
		return (
			<div style={{marginLeft:"210px",marginBottom:"500px"}}>
				{this.returnContent()}
			</div>
		);
	}
}
