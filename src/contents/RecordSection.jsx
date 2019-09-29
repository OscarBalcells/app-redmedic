import React from "react";
import { Button, Collapse } from 'antd';
const { Panel } = Collapse;

import Resource from "./Resource.jsx";

function firstCapitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

let gradients = {
	"allergies": "linear-gradient(#b30086,#ff00bf)",
	"labs": "linear-gradient(#6691ff,#3f2b96)",
	"procedures": "linear-gradient(#00B4DB,#00B4DB)",
	"immunizations": "linear-gradient(#F00000, #DC281E)",
	"medications": "linear-gradient(#33ff77,#00b33c)",
	"conditions": "linear-gradient(#00cccc,#008080)",
	"images": "linear-gradient(#ff1aff,#e600e6)"
}

export default class RecordSection extends React.Component {
		returnResources() {
			//return summaries
			let sectionSingular = firstCapitalize((this.props.section !== "allergies") ? this.props.section.slice(0,-1) : this.props.section.slice(0,-3)+"y");
			if(this.props.individual === false) {
				return this.props.data.map((resource) =>
					<Panel key={resource.id} header={resource.summary+"  -  "+resource.date}>
						<Resource key={resource.id} r={resource} section={sectionSingular}/>
					</Panel>
				);
			} else {
				return this.props.data.map((resource) =>
					<Resource key={resource.id} style={{marginTop:"5px"}} r={resource} section={sectionSingular}/>
				);
			}
		}

		render() {
			let backButton = "";
			if(this.props.individual === true) {
				backButton = (
					<Button type="danger" style={{width:"98%",marginRight:"2%"}} onClick={() => this.props.changeView("all")}>
						Volver Al Inicio
					</Button>
				);
			}

			let content;
			if(this.props.individual === false) {
				content = (
					<Collapse style={{marginRight:"10px"}}>
						{this.returnResources()}
					</Collapse>
				);
			} else {
				content = this.returnResources();
			}

			return (
				<div style={{marginTop:"15px",marginLeft:"10px"}}>
					<div className="section-header"
					style={{background:gradients[this.props.section]}}
					onClick={() => this.props.changeView(this.props.section)}>
						<img src={"./images/"+this.props.section+".png"} width="25px" height="25px"/>
						<b>{firstCapitalize(this.props.section)}</b>
					</div>
					{content}
					{backButton}
				</div>
			);
		}
}
