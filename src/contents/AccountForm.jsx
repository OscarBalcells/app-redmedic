import React from "react";
import Wallet from "../logic/Wallet.js"
import { Button, Icon, Form, Input, Radio } from 'antd';

class AccountForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fase: 1,
			nombre: "",
			fecha: "",
			sexo: "",
			id: "",
			mnemonic: "",
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit(this.state);
	}

	componentDidUpdate(prevProps) {
		if(this.props.resetValues && !prevProps.resetValues) {
			this.setState({
				fase: 1,
				nombre:"",
				fecha:"",
				sexo:"",
				id:"",
				mnemonic:"",
			})
		}
	}

	render() {

		if(this.state.fase === 2) {
			return(
				<Form onSubmit={(e) => this.handleSubmit(e)}>
					<Form.Item label="Nombre y Apellidos">
							<Input
								prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="Oscar Balcells Obeso"
								value={this.state.nombre}
								onChange={(e) => this.setState({nombre:e.target.value})}
							/>
					</Form.Item>
					<Form.Item label="Fecha de nacimiento">
						<Input
								prefix={<Icon type="calendar" style={{color:"rgba(0,0,0,.25)"}} />}
								placeholder="01/03/2002"
								value={this.state.fecha}
								onChange={(e) => this.setState({fecha:e.target.value})}
						/>
					</Form.Item>
					<Form.Item label="Sexo">
						<Radio.Group onChange={(e) => this.setState({sexo:e.target.value})} value={this.state.sexo}>
							<Radio value={"Mujer"}>Mujer</Radio>
							<Radio value={"Hombre"}>Hombre</Radio>
						</Radio.Group>
					</Form.Item>

					<Form.Item label="ID Seguridad social">
						<Input
							prefix={<Icon type="idcard" style={{color:"rgba(0,0,0,.25)"}} />}
							placeholder={"123456789"}
							value={this.state.id}
							onChange={(e) => this.setState({id:e.target.value})}
						/>
					</Form.Item>
					<Button style={{float:"right"}} type="primary" htmlType="submit">Añadir</Button>
				</Form>
			);
		} else if(this.state.fase === 1) {
				return (
					<div>
						<div>
							<h2>Codigo Mnemonico</h2>
							<p>
								Tu clave criptografica para verificar tu identidad en el Blockchain
							  y mantener tus datos seguros se genera a partir de 12
							 	palabras aleatorias que tienes que apuntar y guardar.
							</p>
							<p>
								Si estas creando una identidad en el blockchain por primera vez,
								pulsa el boton para generarlas de forma aleatoria y apuntalas.
								<b> No las escribas tu mismo. </b>
								En caso de que ya tengas una identidad y quieras importarla tan solo
								tienes que escribir las 12 palabras que apuntaste previamente.
							</p>

							<Button type="primary" onClick={() => this.setState({mnemonic:Wallet.generateMnemonic()})}>Generar Palabras</Button>
							<Input.TextArea
								style={{marginTop:"5px",marginBottom:"10px"}}
								value={this.state.mnemonic}
								onChange={(e) => this.setState({mnemonic:e.target.value})}
							/>
						</div>
						<Button type="danger" style={{float:"right"}} onClick={() => this.setState({fase:2})}>Aceptar</Button>
					</div>
				);
		}
	}
}

export default AccountForm;
