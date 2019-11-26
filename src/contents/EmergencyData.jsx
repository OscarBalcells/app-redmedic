import React from "react";
import { Icon, Card, Layout } from 'antd';

export default class EmergencyData extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
			warning: true
		}
    }
    
    render() {
        let warning = "";
        if(this.state.warning) {
            warning = (<Card className="hover-card" style={{marginBottom:"10px"}} title={<h1 style={{color:"red",fontSize:"25px"}}>Warning<Icon style={{marginLeft:"10px"}} type="warning" />
            <div style={{float:"right",cursor:"pointer"}} onClick={() => this.setState({warning:false})}><Icon type="close" /></div></h1>}>
                <b>Emergency data is linked with an official ID so that hospitals can query the necessary
                data based on the identification carried by the injured person. This doesn't mean that
                anyone will be able to access the data, because the user can decide to grant only
                certified accounts (from health providers) access to the emergency data. However, it can
                pose a risk towards the security of your data in the event that the cryptographic private key of
                a certified healthcare provider gets stolen or the center misuses your information.
                Be aware of this risk if you want to use this system function.</b>
            </Card>);
        }
        return(
            <Layout style={{background: '#ECECEC',padding:"30px", overflow:"hidden"}}>
                {warning}
                Bueno, pues aqui están los datos
            </Layout>
        );
    }
}