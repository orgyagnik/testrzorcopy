import React, { useEffect, useState } from 'react';
import APIService from "../../api/APIService";
import { useParams, Link } from "react-router-dom";
import TaskmeLogoWhite from "../../assets/img/logo/taskme-logo-white.png";
import { Container, Spinner } from "react-bootstrap";

export default function Verification() {
  let { token } = useParams();
  const [verification, setVerification] = useState([]);

  useEffect(() => {
    APIService.verification(token)
      .then((response) => {
        if (response.data?.status) {
          setVerification({ status: 1, msg: response.data?.message });
        }
        else {
          setVerification({ status: 0, msg: response.data?.message });
        }
      })
      .catch((error) => {
        setVerification({ status: 0, msg: error });
      });
  }, [token]);

  return (
    <>
      {verification?.msg !== undefined ?
        <>
          <div className="bg-primary signup-header verification-header text-center">
            <Container>
              <a href="/"><img src={TaskmeLogoWhite} alt="Taskme logo" /></a>
            </Container>
          </div>
          <Container>
            <div className="simple-login-form verification-form rounded-20 shadow-1 bg-white">
              <i className={`icon-badge-check d-block mb-5 check-icon ${verification?.status === 1 ? 'text-success' : 'text-danger'}`}></i>
              <h3 className={`text-center mb-4 ${verification?.status === 1 ? 'text-success' : 'text-danger'}`}>{verification?.msg}</h3>
              <div className="d-grid pt-md-2">
                <Link to="/login" className='btn btn-primary mt-5'>Login</Link>
              </div>
            </div>
          </Container>
        </>
        : <Spinner className='pageLoader' animation="border" variant="primary" />
      }
    </>
  );
}