import React from "react";

function cleanString(string) {
	let newString = "";
	for(var i = 0; i < string.length; i++) {
		if(string[i] !== '"' && string[i] !== "[" && string[i] !== "]") {
			if(string.slice(i,i+4) === "text") i += 7
			else if(string.slice(i,i+7) === "display") i += 10;
			else if(string.slice(i,i+6) === "active") {
				newString += "<font color='green'>active</font>";
				i += 5;
				continue;
			} else if(string.slice(i,i+8) === "inactive") {
				newString += "<font color='red'>inactive</font>";
				i += 7;
				continue;
			} else if(string.slice(i,i+9) === "completed") {
				newString += "<font color='green'>completed</font>";
				i += 8;
				continue;
			} else if(string.slice(i,i+4) === "http") {
				newString += "<u>";
				while(string[i] !== '"') { newString += string[i]; i++; }
				newString += "</u>";
				continue;
			}

			if(string[i] === "{" || string[i] === "}") newString += "<b>"

			newString += string[i];

			if(string[i] === "," || (string[i] === ":" && !(string[i-2] === "t" && string[i-1] === "p"))) newString += ' ';
			if(string[i] === "{" || string[i] === "}") newString += "</b>"
		}
	}
	if(newString.slice(0,8) === '<b>{</b>') return newString.slice(8,-8);
	return newString;
}

export default class Resource extends React.Component {

	returnFields() {
		let fields = [];
		for(var prop in this.props.r) {
			if(prop !== "summary" && (prop !== "date" || this.props.r.resourceType === "Immunization") && Object.prototype.hasOwnProperty.call(this.props.r, prop)) {
				let string = JSON.stringify(this.props.r[prop]);
				let cleanedString = cleanString(string);
				let f = (
					<div key={prop}>
						<b>{prop}: </b><span dangerouslySetInnerHTML={{__html:cleanedString}}></span>
					</div>
				);
				fields.push(f);
			}
		}
		return fields;
	}

	render() {
		return (
			<div style={{marginBottom:"10px"}}>
				<h1 style={{textDecoration:"underline",fontSize:"20px",color:"#1E82DA"}}>{this.props.r.summary.split(" -  ")[0]+"  -  "+this.props.section}</h1>
				{this.returnFields()}
			</div>
		);
	}
}
