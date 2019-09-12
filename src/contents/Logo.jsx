import React from "react";
import { Icon } from "antd";

var counter = 1;

export default class Logo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imageUrl: "down",
		}
	}

	dynamicLogo() {
		var imageUrl = "";
		counter++;
		if(counter === 9) counter = 1;
		var imageUrl = "./images/favicons/favicon"+counter+".png";
		this.setState({imageUrl:imageUrl});
	}

	componentDidMount() {
		this.dynamicLogo();
		setInterval(() => {
			this.dynamicLogo();
		}, 2000);
	}

	render() {
		return (
			<span>
				<img style={{width:"20px",height:"20px", marginTop:"10px",marginBottom:"10px",margin:"auto"}} src={this.state.imageUrl} alt="Bitcoin" />
				<h1 style={{color:"white",display:"inline"}}>RedMedic</h1>
			</span>
		);
	}
}
