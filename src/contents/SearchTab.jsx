import React from "react";
import { message, Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const {  Header, Sider } = Layout;

import Wallet from "../logic/Wallet.js";
import Profile from "../logic/Profile.js";
import RecordSection from "./RecordSection.jsx";

let categories  = ["allergies", "labs", "procedures", "immunizations", "medications", "conditions", "images"];
var possibleDates = ["performedDatePeriod","performedPeriod","recordedDate", "date", "dateRecorded",
"effectiveDateTime", "effectiveTimeDate", "dateWritten",
"performedDateTime"];

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

export default class SearchTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ip: "",
			port: "",
			id: "",
			category: "",
			answer: undefined,
			categoryQueried: "",
		};
	}


	fetchStuff(url) {
		return new Promise(function (resolve,reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onload = function() {
				var status = xhr.status;
				if(status == 200) {
					const response = JSON.parse(xhr.responseText);
					if(response.hasOwnProperty("ErrorMessage")) {
						reject(status);
					} else {
						resolve(response["data"]);
					}
				} else {
					reject(status);
				}
			};
			xhr.send();
		});
	}

	async queryData() {
		try {
			if(this.state.category !== "all") {
				let catLen = categories.length;
				for(let i = 0; i < catLen; i++) {
					if(categories[i] === this.state.category) break;
					if(i === catLen-1) throw("405");
				}
			}
			let sig = this.props.profile.wallet.signData("nonce");
			let url = "http://"+this.state.ip+":"+this.state.port+"/nonce/"+sig;
			const nonce = await this.fetchStuff(url);

			const message = this.state.id + "," + this.state.category + "," + nonce.toString();
			sig = this.props.profile.wallet.signData(message);
			url = "http://"+this.state.ip+":"+this.state.port+"/patient/" + this.state.id + "&" +
			this.state.category + "&" + nonce + "&" + sig;
			const data = await this.fetchStuff(url);
			this.setState({categoryQueried:this.state.category});
			this.setState({answer:data});
		} catch (err) {
			console.log(err);
			if(err === "404") message.error("404 Error - Patient not found");
			else if(err == "402") message.error("402 Error - Access denied, invalid signature");
			else if(err == "405") message.error("Error - Invalid Category");
			else if(err === "403") message.error("Error 403 - Invalid Nonce");
			else message.error("Unknown error ocurred: "+err);
			return;
		}
		message.success("Data retrieved successfully");
	}

	renderAnswer() {
		if(this.state.answer == undefined) {
			return "";
		} else if(this.state.answer === "Error") {
			return "An Error ocurred!";
		} else if(this.state.answer.hasOwnProperty("personalData")) {
			let sections = [];
			let pdSection = [];
			let pd = this.state.answer["personalData"];
			pd["summary"] = "Personal Data";
			pd["id"] = 1; pd["date"] = "Recently updated";
			pdSection.push(pd);
			sections.push(<RecordSection key={"personalData"} section={"personalData"} noBack={true} data={pdSection} individual={false} changeView={() => console.log("Changing view")} />);
			for(var i = 0; i < categories.length; i++) {
				let cat = categories[i];
				if(this.state.answer[cat].length === 0) continue;
				let resources = [];
				for(let i = 0; i < this.state.answer[cat].length; i++) {
					let resource = this.state.answer[cat][i];
					resource["summary"] = getSummary(resource);
					resource["date"] = getDate(resource);
					resources.push(resource);
				}
				console.log(cat, resources,this.state.answer[cat]);
				sections.push(<RecordSection key={categories[i]} section={categories[i]} data={resources} individual={false} changeView={() => console.log("Changing view")} />);
			}
			return sections;
		} else {
			let resources = [];
			if(this.state.answer["id"] === this.state.id) {
				let pd = this.state.answer;
				pd["summary"] = "Personal Data";
				pd["id"] = 1;
				pd["date"] = "Recently updated";
				resources.push(<RecordSection key={"personalData"} section={"personalData"} noBack={true} data={pdSection} individual={true} changeView={() => console.log("Changing view")} />);
				return (<RecordSection section={"personalData"} data={resource} individual={true} noBack={true} />);
			}
			for(let i = 0; i < this.state.answer.length; i++) {
				let resource = this.state.answer[i];
				resource["summary"] = getSummary(resource);
				resources.push(resource);
			}
			if(resources.length === 0) return (<div>No resources belonging to this category found</div>);
			return (<RecordSection section={this.state.categoryQueried} data={resources} individual={true} noBack={true}/>);
		}
	}

	render() {
		//<div className="search-addr">Signing queries as address <b>{this.props.profile.wallet.addr}</b></div>
		return (
			<Layout style={{marginLeft:"205px",backgroundColor:"white"}}>
				<Layout style={{backgroundColor:"white",position:"fixed"}}>
					<Sider className="search-sider">
						<div className="search-params"><b>Search Parameters</b></div>
						<Form style={{marginLeft:"10px"}}>
							<Form.Item label="Provider's Gateway IP">
									<Input
										style={{width:"120px"}}
										prefix={<Icon type="gateway" style={{color:"rgba(0,0,0,.25)"}} />}
										placeholder="192.168.0.1"
										value={this.state.ip}
										onChange={(e) => this.setState({ip:e.target.value})}
									/>
							</Form.Item>
							<Form.Item label="Provider's Gateway Port" className="form-item">
								<Input className="input-item"
									style={{width:"120px"}}
									prefix={<Icon type="api" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="5555"
									value={this.state.port}
									onChange={(e) => this.setState({port:e.target.value})}
								/>
							</Form.Item>
							<Form.Item label="Patient ID">
								<Input
									style={{width:"150px"}}
									prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="123456789"
									value={this.state.id}
									onChange={(e) => this.setState({id:e.target.value})}
								/>
							</Form.Item>
							<Form.Item label="Category">
								<Input
									style={{width:"150px"}}
									prefix={<Icon type="snippets" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder="labs"
									value={this.state.category}
									onChange={(e) => this.setState({category:e.target.value})}
								/>
							</Form.Item>
						</Form>
						<div>
							<Button className="request-trigger" type="primary" onClick={() => this.queryData()}>
								Send Request
							</Button>
							<div style={{marginTop:"10px",fontSize:"10px",marginLeft:""}}>
								Queries are being signed using address {this.props.profile.wallet.addr}
							</div>
						</div>
					</Sider>
					<Layout>
						{this.renderAnswer()}
					</Layout>
				</Layout>
			</Layout>
		);
	}
}
