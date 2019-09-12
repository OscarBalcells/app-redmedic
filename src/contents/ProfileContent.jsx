import React from "react";
import { Button, Icon, Input, Form, Radio, Upload, message, Layout } from "antd";
const { Content, Footer } = Layout;

import Profile from "../logic/Profile.js";

//helper functions for adding upload image
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('Solo puedes subir imagenes con el formato JPG o PNG!');
  }
  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    message.error('La foto ha de pesar menos de 5MB!');
  }
  return isJpgOrPng && isLt2M;
}

//this react component displays all the information a profile has
//it lets you do the following things:
//1) Update profile info
//2) Activate profile as main so you can use it
//3) Create new profile
//4) Delete this profile
export default class ProfileContent extends React.Component {

		//this comp has fields and profile. Fields can be edited while profile will
		//stay the same until we call the updateFields function which will syncronize
		//both objects
		constructor(props) {
			super(props);
			this.state = {
				fields: {},
				imageLoading: false,
			};
			this.profile = {};
		}

		//only the id of the profile will be passed and we will load the right profile
		//from the database. Fields will be set to the actual profile data and not empty.
		componentDidMount() {
			console.log("Id:", this.props.id);
			const profile = Profile.getProfileById(this.props.id).then((profile) => {
				console.log("Profiles name:", profile.nombre);
				var fields = profile.toObject();
				if(fields["foto"] === null) {
					fields["foto"] = "";
				}
				this.setState({fields:fields});
				this.profile = profile;
			});
			this.props.mounted();
		}

		//Update Button was clicked so now the profile data will be matched
		//with the fields values
		updateProfile() {
			console.log("Fields updated");
			this.profile.nombre = this.state.fields.nombre;
			this.profile.fecha = this.state.fields.fecha;
			this.profile.sexo = this.state.fields.sexo;
			this.profile.id = this.state.fields.id;
			this.profile.foto = this.state.fields.foto;
			this.profile.update();
		}

		//only change a single field, but we don't update profile yet
		changeField(info, fieldId) {
			if(fieldId === "foto") {
				if (info.file.status === 'uploading') {
		      this.setState({ loading: true });
		      return;
    		}
		    if (info.file.status === 'done') {
		      // Get this url from response in real world.
		      getBase64(info.file.originFileObj, imageUrl => {
						this.setState({imageLoading:false});
						const newFields = this.state.fields;
						newFields[fieldId] = imageUrl;
						this.setState({fields:newFields});
					});
				}
			} else {
				const newFields = this.state.fields;
				newFields[fieldId] = info.target.value;
				this.setState({fields:newFields});
			}
		}

		render() {
			//Upload button changes when it's empty, loading or loaded
			const uploadButton = (
				<div>
	        <Icon type={this.state.imageLoading ? 'loading' : 'plus'} />
	        <div className="ant-upload-text">Upload</div>
	      </div>
			);

			//load the foto of the profile
			const foto = (
				<Upload
					style={{maxWidth:"300px",maxHeight:"100px"}}
					name="avatar"
					listType="picture-card"
					className="avatar-uploader"
					showUploadList={false}
					beforeUpload={beforeUpload}
					onChange={(info) => this.changeField(info, "foto")}
				>
					{this.state.fields.foto != "" ? <img src={this.state.fields.foto} alt="avatar" style={{maxWidth:"200px",maxHeight:"125px"}} /> : uploadButton}
				</Upload>
			);

			return(
					<div style={{height:"100%"}}>
						<Form onSubmit={(e) => this.fieldsUpdated(e)} style={{marginLeft:"10px"}}>
							{foto}
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
									style={{width:"300px"}}
									prefix={<Icon type="idcard" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder={"123456789"}
									value={this.state.fields.id}
									onChange={(e) => this.changeField(e,"id")}
									/>
							</Form.Item>
					</Form>
					<span style={{position:"absolute",right:"15px",top:"95%"}}>
						<Button style={{border:"1px solid #bae7ff"}} type="secondary" onClick={() => this.updateProfile()}>Actualizar datos</Button>
						<Button style={{marginLeft:"5px"}} type="primary" onClick={() => this.props.activateProfile(this.props.id)}>Activar perfil</Button>
						<Button style={{marginLeft:"5px",backgroundColor:"#00B844",border:"1px solid #00B844"}} type="primary" onClick={() => this.props.newProfile()}>Nuevo perfil</Button>
					</span>
				</div>
			);
		}
}
