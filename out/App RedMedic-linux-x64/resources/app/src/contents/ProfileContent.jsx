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
			const profile = Profile.getProfileById(this.props.id).then((profile) => {
				var fields = profile.toObject();
				if(fields["foto"] === null) fields["foto"] = "";
				fields["addr"] = profile.wallet.addr;
				this.setState({fields:fields});
				this.profile = profile;
			});
		}

		//Update Button was clicked so now the profile data will be matched
		//with the fields values
		updateProfile() {
			this.profile.nombre = this.state.fields.nombre;
			this.profile.fecha = this.state.fields.fecha;
			this.profile.sexo = this.state.fields.sexo;
			this.profile.id = this.state.fields.id;
			this.profile.foto = this.state.fields.foto;
			this.profile.mphr = this.state.fields.mphr;
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
			const UploadButton = (
				<div>
	        <Icon type={this.state.imageLoading ? 'loading' : 'plus'} />
	        <div className="ant-upload-text">Upload</div>
	      </div>
			);

			//load the foto of the profile
			const foto = (
				<Upload
					style={{maxWidth:"300px",maxHeight:"100px"}}
					listType="picture-card"
					className="avatar-uploader"
					showUploadList={false}
					beforeUpload={beforeUpload}
					onChange={(info) => this.changeField(info, "foto")}
				>
					{this.state.fields.foto != "" ? <img src={this.state.fields.foto} alt="avatar" style={{maxWidth:"200px",maxHeight:"125px"}} /> : UploadButton}
				</Upload>
			);

			console.log(this.state.fields.foto);

			return(
					<div style={{height:"120%"}}>
						<Form onSubmit={(e) => this.fieldsUpdated(e)} style={{marginLeft:"10px"}}>
							{foto}
							<Form.Item label="Name and Surname" style={{marginTop:"3px",marginBottom:"3px"}}>
									<Input
										style={{width:"300px"}}
										prefix={<Icon type="user" style={{color:"rgba(0,0,0,.25)"}} />}
										placeholder="Oscar Balcells Obeso"
										value={this.state.fields.nombre}
										onChange={(e) => this.changeField(e,"nombre")}
									/>
							</Form.Item>
							<Form.Item label="Date of Birth" style={{marginTop:"3px",marginBottom:"3px"}}>
								<Input
										style={{width:"120px"}}
										prefix={<Icon type="calendar" style={{color:"rgba(0,0,0,.25)"}} />}
										placeholder="01/03/2002"
										value={this.state.fields.fecha}
										onChange={(e) => this.changeField(e, "fecha")}
								/>
							</Form.Item>
							<Form.Item label="Sex" style={{marginTop:"3px",marginBottom:"3px"}}>
								<Radio.Group onChange={(e) => this.changeField(e,"sexo")} value={this.state.fields.sexo}>
									<Radio value={"Mujer"}>Female</Radio>
									<Radio value={"Hombre"}>Male</Radio>
								</Radio.Group>
							</Form.Item>

							<Form.Item label="Healthcare ID" style={{marginTop:"3px",marginBottom:"3px"}}>
								<Input
									style={{width:"300px"}}
									prefix={<Icon type="idcard" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder={"123456789"}
									value={this.state.fields.id}
									onChange={(e) => this.changeField(e,"id")}
									/>
							</Form.Item>
							<Form.Item label="Address of your Ethereum account" style={{marginTop:"3px",marginBottom:"6px"}}>
								<Input
									style={{width:"400px"}}
									prefix={<Icon type="qrcode" style={{color:"rgba(0,0,0,.25)"}} />}
									value={this.state.fields.addr}
									/>
							</Form.Item>
							<Form.Item label="Address of your Master Personal Health Record Contract" style={{marginTop:"3px",marginBottom:"6px"}}>
								<Input
									style={{width:"400px"}}
									prefix={<Icon type="qrcode" style={{color:"rgba(0,0,0,.25)"}} />}
									placeholder={"0x23702ecb660A2b10e6D1c47c6ECbC8F410980f56"}
									value={this.state.fields.mphr}
									onChange={(e) => this.changeField(e,"mphr")}
									/>
							</Form.Item>
					</Form>
					<span style={{position:"absolute",right:"10px",top:"92%"}}>
						<Button style={{border:"1px solid #40a9ff"}} type="secondary" onClick={() => this.updateProfile()}>Update Data</Button>
						<Button style={{marginLeft:"4px"}} type="danger" onClick={() => this.props.activateProfile(this.props.id)}>Activate Profile</Button>
						<Button style={{marginLeft:"4px",backgroundColor:"white",border:"1px solid #00B844",color:"#00B844"}} type="primary" onClick={() => this.props.newProfile()}>New Profile</Button>
					</span>
				</div>
			);
		}
}
