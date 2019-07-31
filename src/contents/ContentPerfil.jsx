import React from "react";
import Perfil from "../logic/Perfil.js";
import { Button, Icon, Input, Form, Radio, Upload, message } from "antd";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
}

class ContentPerfil extends React.Component {

		constructor(props) {
			super(props);
			this.state = {
				fields: {},
				imageLoading: false,
			};
			this.perfil = {}
		}

		changePhoto(info) {
			if(info.file.status == "uploading") {
				this.setState({imageLoading:true});
				return;
			}
			if(info.file.status == "done") {
				getBase64(info.file.originFileObj, imageUrl => {
					this.setState({imageLoading:false});
					const newFields = this.state.fields;
					newFields["foto"] = imageUrl;
					this.setState({fields:newFields});
					this.props.loading = "false";
				});
			}
		}

		componentDidMount() {
			const perfil = Perfil.getPerfilById(this.props.id).then((perfil) => {
				const fields = perfil.toObject();
				this.setState({fields:fields});
				this.perfil = perfil;
			});
		}

		fieldsUpdated(e) {
			e.preventDefault();
			console.log("Fields updated");
			this.perfil.nombre = this.state.fields.nombre;
			this.perfil.fecha = this.state.fields.fecha;
			this.perfil.sexo = this.state.fields.sexo;
			this.perfil.id = this.state.fields.id;
			console.log(this.perfil);
			this.perfil.update();
		}

		changeField(e, fieldId) {
			const newFields = this.state.fields;
			newFields[fieldId] = e.target.value;
			this.setState({fields:newFields});
		}

		render() {
			const uploadButton = (
				<div>
	        <Icon type={this.state.imageLoading ? 'loading' : 'plus'} />
	        <div className="ant-upload-text">Upload</div>
	      </div>
			);
			const foto = (
				<div>
					<Upload
						style={{maxWidth:"300px",maxHeight:"300px"}}
						name="avatar"
						listType="picture-card"
						className="avatar-uploader"
						showUploadList={false}
						beforeUpload={beforeUpload}
						onChange={(info) => this.handleChange(info)}
					>
						{this.fields.imageUrl != "" ? <img src={this.fields.imageUrl} alt="avatar" style={{maxWidth:"300px",maxHeight:"300px"}} /> : uploadButton}
					</Upload>
				</div>
			);
			return(
					<div>
						<span style={{width:"300px", float:"left"}}>
							<Form onSubmit={(e) => this.fieldsUpdated(e)} style={{marginLeft:"10px"}}>
								<Form.Item label="Nombre y Apellidos">
										<Input
											style={{width:"300px"}}
											prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
											placeholder="Oscar Balcells Obeso"
											value={this.state.fields.nombre}
											onChange={(e) => this.changeField(e,"nombre")}
										/>
								</Form.Item>
								<Form.Item label="Fecha de nacimiento">
									<Input
											style={{width:"120px"}}
											prefix={<Icon type="calendar" style={{color:"rgba(0,0,0,.25)"}} />}
											placeholder="01/03/2002"
											value={this.state.fields.fecha}
											onChange={(e) => this.changeField(e, "fecha")}
									/>
								</Form.Item>
								<Form.Item label="Sexo">
									<Radio.Group onChange={(e) => this.changeField(e,"sexo")} value={this.state.fields.sexo}>
										<Radio value={"Mujer"}>Mujer</Radio>
										<Radio value={"Hombre"}>Hombre</Radio>
									</Radio.Group>
								</Form.Item>

								<Form.Item label="ID Seguridad social">
									<Input
										prefix={<Icon type="idcard" style={{color:"rgba(0,0,0,.25)"}} />}
										placeholder={"123456789"}
										value={this.state.fields.id}
									onChange={(e) => this.changeField(e,"id")}
								/>
							</Form.Item>
							<Button style={{float:"right"}} type="primary" htmlType="submit">Actualizar</Button>
						</Form>
					</span>
					<span style={{width:"300px", float:"right"}}>{foto}</span>
				</div>
			);
		}
}

export default ContentPerfil;
