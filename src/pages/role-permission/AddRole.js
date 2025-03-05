import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Col, Row, Form, Accordion, Button, Spinner } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js"
import { toast } from 'react-toastify';
import { capitalizeFirstWithRemoveUnderScore } from "../../utils/functions.js"
import { RoleValidator } from "../../modules/validation/RoleValidator";
import { useHistory } from "react-router-dom";

export default function AddRole(props) {
  let history = useHistory();
  const [permissionData, setPermissionData] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  let nameInput = useRef();
  let codeInput = useRef();
  const [process, setProcess] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    APIService.getPermissionList()
      .then((response) => {
        if (response.data?.status) {
          setPermissionList(response.data?.data);
        }
      });

  }, []);

  function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }

  const handleChangePermission = (e) => {
    if (e.target.checked) {
      setPermissionData([...permissionData, e.target.value]);
    } else {
      setPermissionData(
        permissionData.filter((data) => data !== e.target.value),
      );
    }
  };

  const addRole = async () => {
    setProcess(true);
    setFormErrors([]);

    let validate = validateForm((RoleValidator(nameInput.current?.value, codeInput.current?.value)));
    if (Object.keys(validate).length) {
      setFormErrors(validate);
      setProcess(false);
      validate.nameInput && nameInput.current.focus()
      !validate.nameInput && validate.codeInput && codeInput.current.focus()
    }
    else {
      let params = {};
      params["name"] = nameInput.current?.value;
      params["code"] = codeInput.current?.value;
      params["permissions"] = permissionData;
      APIService.addRole(params)
        .then((response) => {
          if (response.data?.status) {
            toast.success(response.data?.message, {
              position: toast.POSITION.TOP_RIGHT
            });
            nameInput.current.value = '';
            codeInput.current.value = '';
            setPermissionData([]);
            setProcess(false);
            setTimeout(() => {
              history.push("/roles");
            }, 2000);
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
  };


  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Header pagename={props.name ? props.name : ''} />
        <div className="inner-content">
          <Form onSubmit={async e => { e.preventDefault(); await addRole() }}>
            <div className="row">
              <div className="col-md-6 col-lg-2 col-xl-4">
                <Form.Group className="mb-7 w-100 validation-required" controlId="roleName">
                  <Form.Label>Role Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter Role Name" ref={nameInput} className={`${formErrors.nameInput && 'is-invalid'}`} />
                  {formErrors.nameInput && (
                    <span className="text-danger">{formErrors.nameInput}</span>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6 col-lg-2 col-xl-4">
                <Form.Group className="mb-7 w-100 validation-required" controlId="roleCode">
                  <Form.Label>Role Code</Form.Label>
                  <Form.Control type="text" placeholder="Enter Role Code" ref={codeInput} className={`${formErrors.codeInput && 'is-invalid'}`} />
                  {formErrors.codeInput && (
                    <span className="text-danger">{formErrors.codeInput}</span>
                  )}
                </Form.Group>
              </div>
            </div>
            <Accordion alwaysOpen defaultActiveKey={range(0, 500)} className="dashboard-accordion">
              {permissionList.map((permission, index) => (
                <Accordion.Item eventKey={index} alwaysOpen key={index} className="bg-white rounded-10">
                  <Accordion.Header as="h4" className="pt-6 px-6">{capitalizeFirstWithRemoveUnderScore(permission.feature)}</Accordion.Header >
                  <Accordion.Body className="pb-9 px-6">
                    <Row className="g-4">
                      {(permission.capability).split(",").map((sub_per, new_index) => (
                        <Col sm={12} md={6} lg={4} xl={3} key={new_index}>
                          <Form.Check id={`permission-${index}-${new_index}`} type="checkbox" label={capitalizeFirstWithRemoveUnderScore(sub_per)} value={`${permission.feature}.${sub_per}`} checked={permissionData.some((data) => data === `${permission.feature}.${sub_per}`)} onChange={handleChangePermission} />
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            <div className="border-top border-gray-100 pt-6 mt-6 text-end">
            <Button disabled={process} className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { history.push("/roles"); }}>Cancel</Button>
              <Button disabled={process} variant="primary" size="md" type="submit">
                {
                  !process && 'Save'
                }
                {
                  process && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                }
              </Button>
            </div>
          </Form>
        </div>
        <Footer />
      </div>
    </>
  );
}
