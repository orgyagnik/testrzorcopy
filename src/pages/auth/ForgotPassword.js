import React, { useRef, useState } from "react";
import TaskmeLogoWhite from "../../assets/img/logo/taskme-logo-white.png";
import { Button, Form, Container, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { useHistory } from "react-router-dom";
//import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const history = useHistory();
    const [process, setProcess] = useState(false);
    let emailInput = useRef();

    const ForgotPassword = async () => {
        setProcess(true);
        let params = {};
        params["email"] = emailInput.current?.value;
        APIService.forgotPassword(params)
            .then((response) => {
                if (response.data?.status) {
                    emailInput.current.value = "";
                    toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                    setTimeout(() => {
                        history.push("/login");
                    }, 2000);
                }
                else {
                    emailInput.current.value = "";
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcess(false);
                }
            })
            .catch((error) => {
                emailInput.current.value = "";
                toast.error(error, {
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
                <div className="simple-login-form rounded-20 shadow-1 bg-white mb-0">
                    <h2 className="mb-4">Reset password</h2>
                    <Form className="pt-md-4" onSubmit={async e => { e.preventDefault(); await ForgotPassword() }}>
                        <Form.Group className="mb-6" controlId="formBasicEmail">
                            <Form.Label className="form-label-sm">Email address</Form.Label>
                            <Form.Control type="email" required ref={emailInput} />
                        </Form.Group>
                        <div className="d-grid pt-md-2">
                            <Button disabled={process} variant="primary" type="submit">
                                {
                                    !process && 'Send Reset Link'
                                }
                                {
                                    process && <Spinner size="sm" animation="grow" />
                                }
                            </Button>
                            <Button disabled={process} variant="primary" className="mt-2" type="button" onClick={() => { history.push("/login") }}>Sign in</Button>
                        </div>
                    </Form>
                </div>
            </Container>

        </>
    );
}
