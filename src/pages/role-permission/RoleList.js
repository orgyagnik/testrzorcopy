import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Dropdown, Table, Button, Card } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { connect } from "react-redux";
import { check} from "../../utils/functions.js";
import { useHistory } from "react-router-dom";

import PermissionCheck from "../../modules/Auth/PermissionCheck";
import { popperConfig, databaseRoleCode } from '../../settings';
import NoPermission from '../auth/NoPermission';


function RoleList({ userData, name }) {
    const history = useHistory();
    const [roleList, setRoleList] = useState([]);

    useEffect(() => {
        APIService.getRoleList()
            .then((response) => {
                if (response.data?.status) {
                    setRoleList(response.data?.data);
                }
            });
    }, []);

    const handleRoleEdit = async (id) => {
        history.push(`/edit-role/${id}`);
    };

    const handleRoleAdd = () => {
        history.push(`/add-role`);
    }

    return (
        <>
            <Sidebar />
            {(userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.hrCode) ?
                <div className="main-content">
                    <Header pagename={name ? name : ''}  headerFilterButton={ check(['roles.create'], userData?.role.getPermissions) && <Button variant="primary" size="md" type="button" className='ms-auto' onClick={handleRoleAdd}>Add Role</Button>}/>
                    <div className="inner-content pt-0 px-0">
                        <div className="bg-white py-3 px-4 px-xl-7 page-inner-header d-xl-block d-none">
                            <PermissionCheck permissions={['roles.create']}>
                                <Button variant="primary" size="md" type="button" onClick={handleRoleAdd}>Add Role</Button>
                            </PermissionCheck>
                        </div>
                        <div className="pt-0 pt-lg-5 pt-xl-9 px-0 px-lg-4 px-xl-7">
                        <Card className="rounded-10 p-4 p-xl-6">
                            <Card.Body className="p-0">
                                <div className='table-responsive'>
                                    <Table hover className="bg-transparent list-table border-top-0">
                                        <thead>
                                            <tr>
                                                <th>Role Name</th>
                                                <th>Role Code</th>
                                                <th>Total Users</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-top-0">
                                            {roleList.map((role, index) => (
                                                <tr key={index}>
                                                    <td>{role.name}</td>
                                                    <td>{role.code}</td>
                                                    <td>{role.count}</td>
                                                    <td className="text-center">
                                                        <PermissionCheck permissions={['roles.update']}>
                                                            <Dropdown className="category-dropdown edit-task-dropdown" drop="down" align="end">
                                                                <Dropdown.Toggle as="div" bsPrefix="no-toggle" className="cursor-pointer" id="edit-task"><button size="sm" className='btn btn-white circle-btn btn-icon btn-sm'><i className="fa-solid fa-ellipsis-vertical"></i></button></Dropdown.Toggle>
                                                                <Dropdown.Menu as="ul" align="end" className="dropdown-menu-end p-2" popperConfig={popperConfig}>
                                                                    <Dropdown.Item onClick={() => { handleRoleEdit(role.roleid) }}>
                                                                        Edit Role
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </PermissionCheck>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>

                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                        </div>
                    </div>
                    <Footer />
                </div>
            :
                <NoPermission />
            }
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(RoleList)
