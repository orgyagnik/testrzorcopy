import React from 'react';
import { Link } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { toast } from 'react-toastify';
import { DELETE_CUSTOMER } from '../../modules/lang/Customer';
import { confirmAlert } from 'react-confirm-alert';
import { useHistory } from "react-router-dom";
import PermissionCheck from "../../modules/Auth/PermissionCheck";

export default function CustomerLeftPanel({ activeMenu, companyName, id, process }) {
    const history = useHistory();
    const handleDeleteCompany = async () => {
        confirmAlert({
            title: 'Confirm',
            message: DELETE_CUSTOMER,
            buttons: [
                {
                    label: 'Yes',
                    className: 'btn btn-primary btn-lg',
                    onClick: () => {
                        let params = {};
                        params["userid"] = id;
                        APIService.deleteClient(params)
                            .then((response) => {
                                if (response.data?.status) {
                                    toast.success(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                    setTimeout(() => {
                                        history.push("/customers");
                                    }, 1500);
                                }
                                else {
                                    toast.error(response.data?.message, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            });
                    }
                },
                {
                    label: 'No',
                    className: 'btn btn-outline-secondary btn-lg',
                    onClick: () => {

                    }
                }
            ]
        });
    };
    return (
        <aside className="card border border-gray-100 rounded-10 mb-xl-4">
            <div className="p-3 p-md-4 d-flex align-items-center">
                {process ?
                    <Spinner className='me-1' animation="border" variant="primary" />
                    :
                    <>
                        <h3 className="mb-1 ps-md-2 me-auto">{companyName}</h3>
                        <PermissionCheck permissions={['customers.delete']}>
                            <button type="button" className="btn-icon circle-btn btn btn-dark-100 font-12 btn-sm ms-2 me-4" onClick={handleDeleteCompany}><i className="icon-delete"></i></button>
                        </PermissionCheck>
                        <button className="navbar-toggler collapsed d-block d-xl-none p-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav2" aria-controls="navbarNav2" aria-expanded="false" aria-label="Toggle navigation">
                            <svg className="menu-icon" data-name="icons/tabler/hamburger" xlinkHref="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                                <rect data-name="Icons/Tabler/Hamburger background" width="16" height="16" fill="none"></rect>
                                <path d="M15.314,8H.686A.661.661,0,0,1,0,7.368a.653.653,0,0,1,.593-.625l.093-.006H15.314A.661.661,0,0,1,16,7.368a.653.653,0,0,1-.593.626Zm0-6.737H.686A.661.661,0,0,1,0,.632.654.654,0,0,1,.593.005L.686,0H15.314A.661.661,0,0,1,16,.632a.653.653,0,0,1-.593.625Z" transform="translate(0 4)" fill="#1e1e1e"></path>
                            </svg>
                            <svg className="menu-close" data-name="icons/tabler/close" xlinkHref="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                                <rect data-name="Icons/Tabler/Close background" width="16" height="16" fill="none"></rect>
                                <path d="M.82.1l.058.05L6,5.272,11.122.151A.514.514,0,0,1,11.9.82l-.05.058L6.728,6l5.122,5.122a.514.514,0,0,1-.67.777l-.058-.05L6,6.728.878,11.849A.514.514,0,0,1,.1,11.18l.05-.058L5.272,6,.151.878A.514.514,0,0,1,.75.057Z" transform="translate(2 2)" fill="#1e1e1e"></path>
                            </svg>
                        </button>
                    </>
                }
            </div>
            <div className="collapse navbar-collapse d-xl-block" id="navbarNav2">
                <ul className="sidebar-nav">
                    <li>
                        <Link to={`/customer/profile/${id}`} className={`${activeMenu === 'profile' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Profile</span></Link>
                    </li>
                    <li>
                        <Link to={`/customer/contacts/${id}`} className={`${activeMenu === 'contacts' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Contacts</span></Link>
                    </li>
                    <li>
                        <Link to={`/projects?customer_id=${id}`} target="_blank"><span className="font-14 font-weight-normal dark-2">Projects</span></Link>
                    </li>
                    <li>
                        <Link to={`/tasks?customer_id=${id}`} target="_blank"><span className="font-14 font-weight-normal dark-2">All Dev Tasks</span></Link>
                    </li>
                    <li>
                        <Link to={`/site-addons-tasks?customer_id=${id}`} target="_blank"><span className="font-14 font-weight-normal dark-2">Site Add-on Tasks</span></Link>
                    </li>
                </ul>
            </div>
        </aside>

    );
}