import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Form, Icon, Input, Select, Button, Row, Col, notification } from 'antd';
import { useDropzone } from 'react-dropzone';
import NoAvatar from '../../../../assets/img/png/no-avatar.png';
import { uploadAvatarApi, updateUserApi, getAvatarApi } from '../../../../api/user';
import { getAccessTokenApi } from '../../../../api/auth';

import './EditUserForm.scss';

export default function EditUserForm(props) {
    const { user, setIsVisibleModal, setReloadUsers } = props;
    const [avatar, setAvatar] = useState(null);
    const [userData, setUserData] = useState({});

    useEffect(() => {
      setUserData({
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      });
    }, [user])

    useEffect(() => {
      if(user.avatar) {
        getAvatarApi(user.avatar).then(response => {
          setAvatar(response);
        });
      } else {
        setAvatar(null);
      }
    }, [user])

    useEffect(() => {
        if (avatar) {
          setUserData({ ...userData, avatar: avatar.file });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [avatar]);

    const updateUser = e => {
        e.preventDefault();

        const token = getAccessTokenApi();
        const userUpdate = userData;
    
        if (userUpdate.password || userUpdate.repeatPassword) {
          if (userUpdate.password !== userUpdate.repeatPassword) {
            notification["error"]({
              message: "Las contraseñas deben ser iguales."
            });
            return;
          } else {
            delete userUpdate.repeatPassword;
          }
        } 

          if (!userUpdate.fullname|| !userUpdate.email) {
            notification["error"]({
              message: "El nombre y email son obligatorios."
            });
            return;
          }

          if (typeof userUpdate.avatar === "object") {
            uploadAvatarApi(token, userUpdate.avatar, user._id).then(response => {
              userUpdate.avatar = response.avatarName;
              updateUserApi(token, userUpdate, user._id).then(result => {
                notification["success"]({
                  message: result.message
                });
                setIsVisibleModal(false);
                setReloadUsers(true);
              });
            });
          } else {
            updateUserApi(token, userUpdate, user._id).then(result => {
              notification["success"]({
                message: result.message
              });
              setIsVisibleModal(false);
              setReloadUsers(true);
            });
          }
        };

    return (
        <div className='edit-user-form'>
            <UploadAvatar avatar={avatar} setAvatar={setAvatar} />
            <EditForm 
            userData={userData} 
            setUserData={setUserData} 
            updateUser={updateUser} 
            />
        </div>
    )
}

function UploadAvatar(props) {
  const { avatar, setAvatar } = props;
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (avatar) {
      if (avatar.preview) {
        setAvatarUrl(avatar.preview);
      } else {
        setAvatarUrl(avatar);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [avatar]);

  const onDrop = useCallback(
    acceptedFiles => {
      const file = acceptedFiles[0];
      setAvatar({ file, preview: URL.createObjectURL(file) });
    },
    [setAvatar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/jpeg, image/png, image/jpg",
    noKeyboard: true,
    onDrop
  });

  return (
    <div className="upload-avatar" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <Avatar size={150} src={NoAvatar} />
      ) : (
        <Avatar size={150} src={avatarUrl ? avatarUrl : NoAvatar} />
      )}
    </div>
  );
}

function EditForm(props) {
    const { userData, setUserData, updateUser} = props;
    const { Option } = Select;

    return (
        <Form className="form-edit" onSubmit={updateUser}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item>
              <Input
                prefix={<Icon type="user" />}
                placeholder="Nombre Completo"
                Value={userData.fullname}
                onChange={e => setUserData({ ...userData, fullname: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
  
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item>
              <Input
                prefix={<Icon type="mail" />}
                placeholder="Correo electronico"
                Value={userData.email}
                onChange={e =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Select
                placeholder="Selecciona un rol"
                onChange={e => setUserData({ ...userData, role: e })}
                Value={userData.role}
              >
                <Option value="admin">Administrador</Option>
                <Option value="external">Paciente</Option>
                <Option value="internal">Empleado</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
  
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item>
              <Input
                prefix={<Icon type="lock" />}
                type="password"
                placeholder="Contraseña"
                onChange={e =>
                  setUserData({ ...userData, password: e.target.value })
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Input
                prefix={<Icon type="lock" />}
                type="password"
                placeholder="Repetir contraseña"
                onChange={e =>
                  setUserData({ ...userData, repeatPassword: e.target.value })
                }
              />
            </Form.Item>
          </Col>
        </Row>
  
        <Form.Item>
          <Button type="primary" htmlType="submit" className="btn-submit">
            Actualizar Usuario
          </Button>
        </Form.Item>
      </Form>
    )
}