import React, { useState, useEffect } from 'react';
import Sidebar from '../../modules/main/Sidebar';
import Header from '../../modules/main/Header';
import Footer from '../../modules/main/Footer';
import { Row, Col, Card, Table, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { useParams, Link } from "react-router-dom";
import moment from 'moment';
import { display_date_format, databaseRoleCode, display_date_format_with_time } from '../../settings';
import { check, capitalizeFirstWithRemoveUnderScore } from "../../utils/functions.js";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { connect } from "react-redux";
import LastSeen from "../../modules/custom/LastSeen";
import AvatarImg from "../../assets/img/placeholder-image.png";
import StaticDataTable from "../../modules/custom/DataTable/StaticDataTable";
import NoPermission from '../auth/NoPermission';
import LiveClock from 'react-live-clock';

function ProjectDetail({ name, userData }) {
    let { id } = useParams();
    const [userDetail, setUserDetail] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [process, setProcess] = useState(true);
    const [userEditPermission, setUserEditPermission] = useState(1);

    useEffect(() => {
        APIService.getStaffForEdit(id)
            .then((response) => {
                if (response.data?.status) {
                    setUserDetail(response.data?.data);
                    setUserEditPermission(response.data?.data?.edit_user);
                    setProcess(false);
                }
            });

        if (userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.pcCode) {
            let params = "?staffid=" + id;
            APIService.getAllProjects(params)
                .then((response) => {
                    if (response.data?.status) {
                        setProjectList(response.data?.data);
                    }
                });
        }
    }, [id]);

    const columns = [
        {
            name: 'Projects',
            id: 'name',
            sortable: true,
            filterable: true,
            selector: (row) => row?.name,
            cell: (row) => <>
                <Link to={`/project-detail/${row.id}`} className="dark-1">{row.name}</Link>
            </>,
        },
    ];

    return (
        <>
            <Sidebar />
            <div className="main-content">
                <Header pagename={name} />
                {userEditPermission === 1 ?
                    <div className="inner-content pt-0 px-0">
                        <div className="user-detail-page">
                            {!process &&
                                <>
                                    <div className='pt-9 px-4 px-lg-7'>
                                        <Row>
                                            <Col xs={12} xl={7} xxl={7}>
                                                <Card className="rounded-10 border border-gray-100 mb-4">
                                                    <Card.Body className="p-0">
                                                        <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                                            <h3 className="card-header-title mb-0 my-md-2 ps-md-3 float-start me-2">{`${userDetail.firstname} ${userDetail.lastname}`}</h3>
                                                            {userDetail.edit_user === 1 && check(['users.update'], userData?.role.getPermissions) &&
                                                                <>
                                                                    {userDetail.role_code === databaseRoleCode.agencyCode || userDetail.role_code === databaseRoleCode.agencyMemberCode ?
                                                                        <Link to={`/edit-agency-user/${userDetail?.id}`} type="button" className="btn-icon circle-btn btn btn-soft-primary btn-sm ms-auto">
                                                                            <i className="icon-edit"></i>
                                                                        </Link>
                                                                        :
                                                                        <Link to={`/edit-user/${userDetail?.id}`} type="button" className="btn-icon circle-btn btn btn-soft-primary btn-sm ms-auto">
                                                                            <i className="icon-edit"></i>
                                                                        </Link>
                                                                    }
                                                                </>
                                                            }
                                                        </div>
                                                    </Card.Body>
                                                    <Card.Body className="px-md-4 py-4">
                                                        <div className="px-md-3 py-md-3">
                                                            {userDetail.active !== 1 &&
                                                                <div className="alert alert-danger" role="alert">This staff member account is inactive</div>
                                                            }
                                                            {userDetail.profile_image !== '' && userDetail.profile_image !== null ?
                                                                <img className="user-img mb-5 mx-auto d-block" src={`${userDetail.profile_image}`} alt="Avatar" onError={({ currentTarget }) => {
                                                                    currentTarget.onerror = null;
                                                                    currentTarget.src = AvatarImg;
                                                                }} />
                                                                :
                                                                <img className="user-img mb-5 mx-auto d-block" src={AvatarImg} alt="Avatar" />
                                                            }
                                                            <Table hover size="md" className="list-table border-top-0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="font-weight-semibold w-25">User #</td>
                                                                        <td>{userDetail?.id}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Name</td>
                                                                        <td>{`${userDetail.firstname} ${userDetail.lastname}`}</td>
                                                                    </tr>
                                                                    {userDetail.agency_name && (userDetail.role_code === databaseRoleCode.agencyCode || userDetail.role_code === databaseRoleCode.agencyMemberCode) &&
                                                                        <>
                                                                            <tr>
                                                                                <td className="font-weight-semibold">Agency Name</td>
                                                                                <td>{userDetail.agency_name}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="font-weight-semibold">Project Manager</td>
                                                                                <td>
                                                                                    {userDetail?.pc_members.map((pcUser, index) => (
                                                                                        <Link to={`/user-detail/${pcUser.id}`} key={index} className={`${index === 0 ? '' : 'ms-2'}`}>
                                                                                            <Badge bg="secondary" className="p-2 mt-2">{pcUser.name}</Badge>
                                                                                        </Link>
                                                                                    ))}
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    }
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Email</td>
                                                                        <td>{userDetail.email}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Designation</td>
                                                                        <td>{userDetail?.designation_name ? capitalizeFirstWithRemoveUnderScore(userDetail?.designation_name) : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Role</td>
                                                                        <td>{userDetail?.role ? capitalizeFirstWithRemoveUnderScore(userDetail?.role) : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Last Logged In</td>
                                                                        <td>{userDetail.last_login && userDetail.last_login !== null ?
                                                                            <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-1`}> {moment(userDetail.last_login).format(display_date_format_with_time)}</Tooltip>}>
                                                                                <span href="#" className="commnets-time dark-7 ms-md-2 font-12 mt-1 text-nowrap d-md-inline-block d-block">
                                                                                    <LastSeen date={Date.parse(moment(userDetail.last_login).format())} />
                                                                                </span>
                                                                            </OverlayTrigger>
                                                                            : 'Never'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Date of Birth</td>
                                                                        <td>{userDetail.dob ? moment(userDetail.dob).format(display_date_format) : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Date of Joining</td>
                                                                        <td>{userDetail.date_of_joining ? moment(userDetail.date_of_joining).format(display_date_format) : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Country</td>
                                                                        <td>{userDetail.country ? userDetail.country : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">State</td>
                                                                        <td>{userDetail.state ? userDetail.state : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">City</td>
                                                                        <td>{userDetail.city ? userDetail.city : '-'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="font-weight-semibold">Gender</td>
                                                                        <td>{userDetail?.gender ? capitalizeFirstWithRemoveUnderScore(userDetail?.gender) : '-'}</td>
                                                                    </tr>
                                                                    {userDetail?.role_code === databaseRoleCode.agencyCode || userDetail?.role_code === databaseRoleCode.agencyMemberCode ?
                                                                        <tr>
                                                                            <td className="font-weight-semibold">Timezone</td>
                                                                            <td>
                                                                                {userDetail?.time_zone ?
                                                                                    <>
                                                                                        {userDetail?.time_zone}
                                                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Current Time: <LiveClock className="" format={display_date_format_with_time} ticking={true} timezone={userDetail?.time_zone} /> </Tooltip>}>
                                                                                            <i className="fa-regular fa-clock dark-2 ms-2 font-10"></i>
                                                                                        </OverlayTrigger>
                                                                                    </>
                                                                                    : '-'}
                                                                            </td>
                                                                        </tr>
                                                                        : ''}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            {userData.role_code === databaseRoleCode.adminCode || userData.role_code === databaseRoleCode.pcCode ?
                                                <Col xs={12} xl={5} xxl={5}>
                                                    <Card className="rounded-10 border border-gray-100 mb-4">
                                                        <Card.Body className="p-0">
                                                            <div className="d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-gray-100">
                                                                <h3 className="card-header-title mb-0 my-md-2 ps-md-3">Projects</h3>
                                                            </div>
                                                        </Card.Body>
                                                        <Card.Body className="px-md-4 py-4 static-datatable-card-body">
                                                            <div className="px-md-3">
                                                                <StaticDataTable columns={columns} data={projectList} isExport={false} />
                                                                {/* <ListGroup className="list-group-flush">
                                                                {projectList.length > 0 && projectList.map((project, index) => (
                                                                    <ListGroup.Item key={index}>
                                                                        <div className="row align-items-center px-md-2">
                                                                            <div className="col p-0">
                                                                                <h6 className="mb-1 font-weight-semibold"><Link to={`/project-detail/${project.id}`}>{project.name}</Link></h6>
                                                                            </div>
                                                                        </div>
                                                                    </ListGroup.Item>
                                                                ))}
                                                            </ListGroup> */}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                : ''}
                                        </Row>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                    :
                    <NoPermission />
                }
                <Footer />
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    userData: state.Auth.user
})

export default connect(mapStateToProps)(ProjectDetail)