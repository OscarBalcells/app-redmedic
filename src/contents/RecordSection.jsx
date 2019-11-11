import React from "react";
import { Button, Collapse, Icon } from 'antd';
const { Panel } = Collapse;

import Resource from "./Resource.jsx";

function firstCapitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

let gradients = {
	"allergies": "linear-gradient(#b30086,#ff00bf)",
	"labs": "linear-gradient(#6691ff,#3f2b96)",
	"procedures": "linear-gradient(#00B4DB,#00B4DB)",
	"immunizations": "linear-gradient(#33ff77,#00b33c)",
	"medications": "linear-gradient(#F00000, #DC281E)",
	"conditions": "linear-gradient(#00cccc,#008080)",
	"images": "linear-gradient(#ff1aff,#e600e6)",
	"personalData": "linear-gradient(rgba(219,40,40,1), rgba(252,124,69,1))"
}

export default class RecordSection extends React.Component {
		returnResources() {
			//return summaries
			let sectionSingular;
			if(this.props.section === "allergies") sectionSingular = "Allergy";
			else if(this.props.section === "personalData") sectionSingular = "Personal Data Segment";
			else sectionSingular = this.props.section.slice(0,-1);

			if(this.props.individual === false) {
				let ind = -1;
				return this.props.data.map((resource) => {
						ind += 1;
						return (
						<Panel key={resource.id} header={resource.summary+"  -  "+resource.date}>
							<Resource key={resource.id} r={resource} section={sectionSingular} changeView={() => this.props.changeView("image:"+ind.toString())}/>
						</Panel>);
				});
			} else {
				let ind = -1;
				return this.props.data.map((resource) => {
					ind += 1;
					return (<Resource key={resource.id} style={{marginTop:"5px"}} r={resource} changeView={() => this.props.changeView("image:"+ind.toString())} section={sectionSingular}/>);
				});
			}
		}

		render() {
			if(this.props.individual === true) {
				let backButton = <Button type="danger" style={{marginBottom:"5px"}} onClick={() => this.props.changeView("all")}>Back <Icon type="rollback" /></Button>
				//let backButton = (this.props.noBack === true ? "" : <Button type="danger" style={{width:"98%",marginRight:"2%"}} onClick={() => this.props.changeView("all")}>Back</Button>);
				return (
					<div style={{marginTop:"15px",marginLeft:"10px"}}>
						{backButton}
						{this.returnResources()}
					</div>
				);
			}

			let title = firstCapitalize(this.props.section);
			if(title === "PersonalData") title = "Personal Data";

			return (
				<div style={{marginTop:"15px",marginLeft:"10px"}}>
					<div className="section-header"
					style={{background:gradients[this.props.section]}}
					onClick={() => this.props.changeView(this.props.section)}>
						<img src={"./images/"+this.props.section+".png"} width="25px" height="25px"/>
						<b>{firstCapitalize(this.props.section)}</b>
					</div>
					<Collapse style={{marginRight:"10px"}}>
						{this.returnResources()}
					</Collapse>
				</div>
			);
		}
}
