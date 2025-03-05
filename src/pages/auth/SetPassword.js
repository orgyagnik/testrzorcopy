import React, { useRef, useState } from "react";
import TaskmeLogoWhite from "../../assets/img/logo/taskme-logo-white.png";
import { Button, Form, Container, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { useHistory, useParams } from "react-router-dom";
import { PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION } from '../../modules/lang/Auth';

export default function SetPassword() {
  const [process, setProcess] = useState(false);
  let passwordInput = useRef();
  let confirmPasswordInput = useRef();
  const history = useHistory();
  let { token } = useParams();

  const setPassword = async () => {
    setProcess(true);
    let params = {};
    if (passwordInput.current?.value === confirmPasswordInput.current?.value) {
      params["token"] = token;
      params["password"] = passwordInput.current?.value;
      params["confirm_password"] = confirmPasswordInput.current?.value;
      APIService.passwordSet(params)
        .then((response) => {
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setTimeout(() => {
              history.push('/login');
            }, 1500);
            setProcess(false);
          }
          else {
            toast.error(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            setProcess(false);
          }
        })
        .catch((error) => {
          toast.error(error, {
            position: toast.POSITION.TOP_RIGHT
          });
          setProcess(false);
        });
    }
    else {
      toast.error(PASSWORD_CONFIRM_PASSWORD_SAME_VALIDATION, {
        position: toast.POSITION.TOP_RIGHT
      });
      setProcess(false);
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="bg-primary signup-header text-center">
        <Container>
          <a href="/"><img src={TaskmeLogoWhite} alt="Taskme logo" /></a>
        </Container>
      </div>
      <Container>
        <div className="simple-login-form rounded-20 shadow-1 bg-white mb-0">
          <h2 className="mb-4">Set password</h2>
          <Form className="pt-md-4" onSubmit={async e => { e.preventDefault(); await setPassword() }}>
            <Form.Group className="mb-6" controlId="formBasicEmail">
              <Form.Label className="form-label-sm">Password</Form.Label>
              <Form.Control type="password" required ref={passwordInput} />
            </Form.Group>
            <Form.Group className="mb-6" controlId="formBasicEmail">
              <Form.Label className="form-label-sm">Confirm Password</Form.Label>
              <Form.Control type="password" required ref={confirmPasswordInput} />
            </Form.Group>
            <div className="d-grid pt-md-2">
              <Button disabled={process} variant="primary" type="submit">
                {
                  !process && 'Submit'
                }
                {
                  process && <Spinner size="sm" animation="grow" />
                }
              </Button>
            </div>
          </Form>
        </div>
      </Container>

    </>
  );
}