import React from "react";
import Nav from 'react-bootstrap/Nav';
import { Link } from "react-router-dom";
import PermissionCheck from "../Auth/PermissionCheck";
import { useLocation } from 'react-router-dom';
import { databaseRoleCode } from '../../settings';

export function SideBarItem({ user, name, base, permissions, path, icon, hidden, super_admin_show, menuActivePaths, className }) {

    const location = useLocation();
    const pathname = location.pathname;
    let isActive = false;
    if (pathname !== path && pathname !== '') {
        if (menuActivePaths) {
            let findArray = menuActivePaths.filter(function (menu) { return pathname.includes(menu); });
            if (findArray.length > 0) {
                isActive = true;

            }
        }
    }
    else {
        isActive = true;
    }

    if (super_admin_show) {
    } else {
        if (hidden)
            return <></>
    }

    const closeSideBarMenu = () => {
        localStorage.setItem("drawerPosition", true);
    }
    
    
    return <PermissionCheck permissions={permissions}>
        {user.role.code === databaseRoleCode.clientCode && name === "Site Add-on Tasks" ? '' :
            <>
                {name === "Manage Dev Plans" ?
                    <>
                        {user?.current_plan?.includes('dev') ?
                            <Nav.Item as="li" className={className}>
                                <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                            </Nav.Item> : ''}
                    </>
                    :
                    name === "Bucket Tracking Report" && (user.role.code === databaseRoleCode.clientCode || user.role.code === databaseRoleCode.agencyCode || user.role.code === databaseRoleCode.agencyMemberCode) ?
                        <>
                            {user?.current_plan?.includes("bucket") &&
                                <Nav.Item as="li" className={className}>
                                    <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                </Nav.Item>
                            }
                        </>
                        :
                        name === "Time Tracking Report" && (user.role.code === databaseRoleCode.clientCode || user.role.code === databaseRoleCode.agencyCode || user.role.code !== databaseRoleCode.agencyMemberCode) ?
                            <>
                                {/* {user?.current_plan.includes("dev-personalized-addon") && */}
                                    <Nav.Item as="li" className={className}>
                                        <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                    </Nav.Item>
                                {/* } */}
                            </>
                            :
                            name === "Agency Bucket Plans" ?
                                <>
                                    {user.role.code !== databaseRoleCode.agencyCode && user.role.code !== databaseRoleCode.clientCode && user.role.code !== databaseRoleCode.agencyMemberCode &&
                                        <Nav.Item as="li" className={className}>
                                            <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                        </Nav.Item>
                                    }
                                </>
                                :
                                name === "Remote Work Request" ?
                                    (user.is_wfh === 0 || user.role.code === databaseRoleCode.adminCode) ?
                                        <Nav.Item as="li" className={className}>
                                            <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                        </Nav.Item> : ''
                                :
                                name === "Remaining Leave List" ?
                                    (user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode) ?
                                        <Nav.Item as="li" className={className}>
                                            <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                        </Nav.Item> : ''
                                    :
                                    name === "Roles" ?
                                        (user.role.code === databaseRoleCode.adminCode || user.role.code === databaseRoleCode.hrCode) ?
                                            <Nav.Item as="li" className={className}>
                                                <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                            </Nav.Item> : ''
                                        :
                                        (user.role.code === databaseRoleCode.clientCode && name === "Favourite Tasks") ?
                                            '' :
                                            <Nav.Item as="li" className={className}>
                                                <Link to={base + path} onClick={() => closeSideBarMenu()} className={`nav-link ${isActive ? 'active' : ''}`}><i className={icon}></i><span>{user.role.code === databaseRoleCode.clientCode && name === "All Dev Tasks" ? 'Tasks' : name}</span></Link>
                                            </Nav.Item>

                }
            </>
        }
    </PermissionCheck>
}