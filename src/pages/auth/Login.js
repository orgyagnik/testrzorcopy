import React, { useRef, useState, useEffect } from "react";
import TaskmeLogoWhite from "../../assets/img/logo/taskme-logo-white.png";
import { Button, Form, Spinner, Alert, Container } from "react-bootstrap";
import APIService from "../../api/APIService";
import { encryptToken } from "../../utils/functions.js"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";

export default function Login() {
  const [process, setProcess] = useState(false);
  const [error, setError] = useState('');
  const [authCode, setAuthCode] = useState(false);
  let emailInput = useRef();
  let passwordInput = useRef();
  let authCodeInput = useRef();

  useEffect(() => {
  }, [authCode]);

  const login = async () => {
    setError('');
    setProcess(true);
    let params = {};
    params["email"] = emailInput.current?.value;
    params["password"] = passwordInput.current?.value;
    /*params["email"] = encryptToken(emailInput.current?.value);
    params["password"] = encryptToken(passwordInput.current?.value);*/
    if (authCode)
      params["code"] = authCodeInput.current?.value;

    APIService.getLogin(params)
      .then((response) => {
        if (response.status === 201) {
          localStorage.setItem("rz_access_token", encryptToken(response.data?.data.access_token));
          localStorage.setItem("rz_refreshToken", encryptToken(response.data?.data.refresh_token));
          localStorage.setItem("rz_user_role", encryptToken(response.data?.data.role));
          window.location.reload(); 
          //Store.dispatch(saveUserObject(response.data?.data));
          //history.push('/');
        }
        else if (response.status === 202) {
          toast.success(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setAuthCode(true);
          setProcess(false);
        }
        else {
          if (authCode) {
            authCodeInput.current.value = "";
          }
          else {
            emailInput.current.value = "";
            passwordInput.current.value = "";
          }
          toast.error(response.data?.message, {
            position: toast.POSITION.TOP_RIGHT
          });
          setProcess(false);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message, {
          position: toast.POSITION.TOP_RIGHT
        });
        setProcess(false);
      });
  }

  return (
    <>
      <ToastContainer />
      <div className="bg-primary signup-header text-center">
        <Container className="custom-container">
          <a href="/"><img src={TaskmeLogoWhite} alt="Taskme logo" /></a>
        </Container>
      </div>
      <Container>
        <div className="simple-login-form rounded-20 shadow-1 bg-white">
          {error !== '' &&
            <Alert key="danger" variant="danger">
              {error}
            </Alert>
          }
          <h2 className="mb-4">Sign in</h2>
          <Form className="pt-md-4" onSubmit={async e => { e.preventDefault(); await login() }}>
            <Form.Group className="mb-5" controlId="formBasicEmail">
              <Form.Label className="form-label-sm">Email address</Form.Label>
              <Form.Control type="email" required ref={emailInput} />
            </Form.Group>
            <Form.Group className="mb-5" controlId="formBasicPassword">
              <Form.Label className="form-label-sm">Password</Form.Label>
              <Form.Control type="password" required ref={passwordInput} />
            </Form.Group>
            {authCode &&
              <Form.Group className="mb-5" controlId="formBasicEmail">
                <Form.Label className="form-label-sm">Verification Code</Form.Label>
                <Form.Control type="number" required ref={authCodeInput} />
              </Form.Group>
            }
            <div className="d-grid pt-md-2">
              <Button disabled={process} variant="primary" type="submit">
                {
                  !process && 'Sign in'
                }
                {
                  process && <Spinner size="sm" animation="grow" />
                }
              </Button>
            </div>
            <div className="my-4 my-sm-4 d-flex">
              {/* <Form.Check className="form-check-sm mb-0 font-weight-regular" type="checkbox" id="remember" label="Remember me" /> */}
              <Link to="/forgot-password" className='text-gray-600 ms-auto mt-1'>Forgot password?</Link>
            </div>
            {/* <div className="border-top border-gray-200 pt-4 pt-sm-5 text-center">
              <span className="text-gray-700">Don't have an account? <Link to="/dev-plan-checkout" className='link-primary'>Sign up</Link></span>
            </div> */}
          </Form>
        </div>
      </Container>
    </>
  );
}
