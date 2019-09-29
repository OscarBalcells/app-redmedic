import React from "react";
var counter = 1;

export default class Logo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imageUrl: "./images/favicons/favicon1.png"
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
		}, this.props.interval);
	}

	render() {
		return (
			<span>
				<img style={{width:this.props.width,height:this.props.height,marginBottom:"10px"}} src={this.state.imageUrl} alt="" />
			</span>
		);
	}
}
