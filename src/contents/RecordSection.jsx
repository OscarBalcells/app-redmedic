import React from "react";
import { message, Tabs, Button, Icon, Layout, Form, Input, Modal, Radio } from 'antd';
const { Header, Content, Footer } = Layout;

import Resource from "./Resource.jsx";

function firstCapitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class RecordSection extends React.Component {
		returnResources() {
			//return summaries
			if(this.props.individual === false) {
				return this.props.data.map((resource) =>
					<div key={resource.id} style={{display:"block"}}>
						<p style={{display:"inline-block"}}><b>{resource.summary}</b></p>
						<p style={{margin:"1px solid red",float:"right",marginRight:"25px"}}>{resource.date}</p>
					</div>
				);
			} else {
				let resources = [];
				for(var i = 0; i < this.props.data.length; i++) {
					resources.push(
						<Resource key={this.props.data[i].id} r={this.props.data[i]} />
					);
				}
				return resources;
			}
		}

		render() {
			return (
				<div style={{marginTop:"15px",marginLeft:"10px",marginBottom:this.props.marginBottom}}>
					<div style={{marginBottom:"5px"}} onClick={() => this.props.changeView(this.props.section)}>
						<img src={"./images/"+this.props.section+".png"} width="25px" height="25px" style={{marginLeft:"0px",marginBottom:"10px",marginRight:"15px"}}/>
						<b style={{fontSize:"30px",color:"#FF5E5E",borderBottom:"3px solid #FF5E5E"}}>{firstCapitalize(this.props.section)}</b>
					</div>
					{this.returnResources()}
				</div>
			);
		}
}
