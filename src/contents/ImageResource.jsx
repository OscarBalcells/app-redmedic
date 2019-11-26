import React from "react";
import { Button, Icon, Card } from "antd";

export default class ImageResource extends React.Component {
	render() {
		return (
			<div>
				<Button type="danger" onClick={() => this.props.changeView()}>Back <Icon type="rollback" /></Button>
				<Card
				    hoverable
						style={{width:"600px",marginTop:"15px"}}
				    cover={<img alt="Error loading the picture" src={this.props.content.data} />}
			  	>
		    	<Card.Meta title={this.props.content.notes} description={
						<div>
							<p>Taken on day: <b>{this.props.content.date}</b></p>
							<p>Belongs to category: <b>{this.props.content.category}</b></p>
						</div>
					}/>
		  	</Card>
			</div>
		);
	}
}
