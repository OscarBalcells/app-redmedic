import React from "react";
import { message, Button, Icon, Form, Input } from 'antd';
import request from 'request-promise';
import RecordSection from "./RecordSection.jsx";
const { Categories, GetSummary, GetDate } = require("../logic/Settings.js");

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

	async queryData() {
		try {
			if(this.state.category !== "all") {
				let catLen = Categories.length;
				for(let i = 0; i < catLen; i++) {
					if(Categories[i] === this.state.category) break;
					if(i === catLen-1) throw("405");
				}
			}

			var sig = this.props.profile.wallet.signData("nonce");
			var url = "https://"+this.state.ip+":"+this.state.port+"/nonce/"+sig;

			request({ method: "GET", uri: url, rejectUnauthorized: false, insecure: true }).then(async (response) => {
				if(!response.hasOwnProperty("SuccessMessage"))  throw(reponse["ErrorMessage"]); //error ocurred!

				const nonce = response["data"];
				const message = this.state.id + "," + this.state.category + "," + nonce.toString();
				sig = this.props.profile.wallet.signData(message);
				url = "https://"+this.state.ip+":"+this.state.port+"/patient/" + this.state.id + "&" + this.state.category + "&" + nonce + "&" + sig;

				request({ method: "GET", uri: url, rejectUnauthorized: false, insecure: true }).then(async (response) => {
					if(!response.hasOwnProperty("SuccessMessage"))  throw(reponse["ErrorMessage"]); //error ocurred!

					this.setState({categoryQueried:this.state.category,answer:response["data"]});
					message.success("Data retrieved successfully");
				});
			});
		} catch (err) {
			console.log(err);
			if(err === "404") message.error("404 Error - Patient not found");
			else if(err == "402") message.error("402 Error - Access denied");
			else if(err === "403") message.error("Error 403 - Invalid Nonce");
			else if(err == "405") message.error("Error - Invalid Category");
			else message.error("Unknown error ocurred: "+err);
		}
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
			for(var i = 0; i < Categories.length; i++) {
				let cat = Categories[i];
				if(this.state.answer[cat].length === 0) continue;
				let resources = [];
				for(let i = 0; i < this.state.answer[cat].length; i++) {
					let resource = this.state.answer[cat][i];
					resource["summary"] = GetSummary(resource);
					resource["date"] = GetDate(resource);
					resources.push(resource);
				}
				console.log(cat, resources,this.state.answer[cat]);
				sections.push(<RecordSection key={Categories[i]} section={Categories[i]} data={resources} individual={false} changeView={() => console.log("Changing view")} />);
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
				resource["summary"] = GetSummary(resource);
				resources.push(resource);
			}
			if(resources.length === 0) return (<div>No resources belonging to this category found</div>);
			return (<RecordSection section={this.state.categoryQueried} data={resources} individual={true} noBack={true}/>);
		}
	}

	render() {
		return (
			<div style={{padding:"30px"}}>
				<div className="search-sider">
					<div className="hover-card" style={{borderRadius:"8px",border:"1px solid grey",padding:"10px"}}>
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
							<Button className="request-trigger" type="primary" onClick={() => this.queryData()}>
								Send Request
							</Button>
						</div>

						<div className="hover-card" style={{borderRadius:"8px",marginTop:"15px",border:"1px solid grey",fontSize:"13px",padding:"10px"}}>
							Queries are being signed with the account represented by the following address:<br></br>
							<b>{this.props.profile.wallet.addr}</b>
						</div>
					</div>
				<div>
					{this.renderAnswer()}
				</div>
			</div>
		);
	}
}
