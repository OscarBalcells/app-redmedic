import React from "react";
import '../css/App.css';
import Lateral from "./Lateral.js";

const appStyle = {
	color: "blue",
	borderTop: "1px solid red",
}

class App extends React.Component {
  render() {
		return(
			<div style={appStyle}>
				<h1>Esta es mi app</h1>
				<Lateral />
			</div>
		);
	}
}

export default App;
