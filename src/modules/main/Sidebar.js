import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import SidebarLogo from "../../assets/img/logo/taskme-logo.png";
import SidebarLogoWhite from "../../assets/img/logo/taskme-logo.png";
import SidebarLogoExpand from "../../assets/img/logo/taskme-icon.png";
import SimpleBar from 'simplebar-react';
//import SearchIcon from "../../assets/img/icons/serach.svg";
import { Link } from "react-router-dom";
import routes from "../../routing/routes";
import { SideBarItem } from "./SideBarItem";
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { setFavoritesTask } from "../../store/reducers/App";
import Store from "../../store";
import { databaseRoleCode } from '../../settings';
import { DELETE_FAVOURITETASK } from '../../modules/lang/Task';
import { confirmAlert } from 'react-confirm-alert';
import Collapse from 'react-bootstrap/Collapse';
import { check } from "../../utils/functions.js";
import { useLocation } from 'react-router-dom';

function Sidebar({ user, favoritesTask }) {
   const [openFavourite, setOpenFavourite] = useState(true);
   let openSetupMenu = false;
   const location = useLocation();
   const pathname = location.pathname;
   routes?.filter(function (arr) { return arr.isSetup; }).map((value) => {
      if (pathname === value.path) {
         openSetupMenu = true;
      }
      else {
         if (value.isMenu) {
            let findArray = value.menuActivePaths.filter(function (menu) { return pathname.includes(menu); });
            if (findArray.length > 0) {
               openSetupMenu = true;
            }
         }
      }
      return '';
   });
   const [openSubMenu, setOpenSubMenu] = useState(openSetupMenu);
   const handleAddRemoveFavorite = (status, taskId) => {
      confirmAlert({
         title: 'Are you sure?',
         message: DELETE_FAVOURITETASK,
         buttons: [
            {
               label: 'Yes',
               className: 'btn btn-primary btn-lg',
               onClick: () => {
                  let params = {};
                  params["taskid"] = parseInt(taskId);
                  params["remove"] = status;
                  params["staffid"] = user.role.code === databaseRoleCode.clientCode ? user?.userid : user?.id;
                  APIService.addRemoveFavorite(params)
                     .then((response) => {
                        if (response.data?.status) {
                           toast.success(response.data?.message, {
                              position: toast.POSITION.TOP_RIGHT
                           });
                           APIService.getFavavoriteTasks()
                              .then((response) => {
                                 if (response.data?.status) {
                                    Store.dispatch(setFavoritesTask(response.data?.data));
                                 }
                              });
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
   }

   const loginBackToAdmin = () => {
      localStorage.setItem("rz_access_token", localStorage.getItem("accessToken_old"));
      localStorage.setItem("rz_refresh_token", localStorage.getItem("refreshToken_old"));
      localStorage.setItem("rz_user_role", localStorage.getItem("rz_user_role_old"));

      localStorage.removeItem("accessToken_old");
      localStorage.removeItem("refreshToken_old");
      localStorage.removeItem("rz_user_role_old");
      //window.location.reload();
      window.location.href = window.location.origin;
   }
   
   return (
      <Navbar expand="lg" className="navbar-vertical" variant="dark">
         {/* <Navbar.Brand href="/" className="mx-auto d-none d-lg-block">
            <img src={SidebarLogo} alt="Taskme" className="taskme-logo-main" />
            <img src={SidebarLogoExpand} alt="Taskme" className="muze-icon" />
         </Navbar.Brand> */}
         <Link to="/" className="mx-auto d-none d-lg-block navbar-brand">
            <img src={SidebarLogo} alt="Taskme" className="taskme-logo-main" />
            <img src={SidebarLogoWhite} alt="Taskme" className='white-logo2'/>
            <img src={SidebarLogoExpand} alt="Taskme" className="muze-icon" />
         </Link>
         <Navbar.Collapse className="show">
            <SimpleBar className="navbar-nav mb-2" id="accordionExample">
               {localStorage.getItem("accessToken_old") !== null && localStorage.getItem("accessToken_old") !== undefined &&
                  <Nav.Item as="li">
                     <a className="nav-link btn btn-primary btn-md" onClick={loginBackToAdmin}><i className='icon-arrow'></i><span>Back to Admin</span></a>
                  </Nav.Item>
               }
               {
                  routes.map(function (value, index) {
                     if (value.isMenu && !value.isSetup) {
                        if (value.child === undefined)
                           return <SideBarItem user={user} key={index} base="" {...value} className='' />
                        else
                           return <SideBarItem user={user} key={index} {...value.child[0]} base={value.path} name={value.name} className='' />
                     }
                     return '';
                  })
               }
               {check(['leavebucket.view', 'users.view', 'agency_users.view', 'roles.view', 'agencysites.view', 'ratings.view', 'logs.view', 'tasks.unattended', 'designations.view', 'customers.view', 'bucketreport.view', 'devreport.view', 'email_template.view', 'notice.view'], user?.role?.getPermissions) &&
                  <Nav.Item as="li" className="sidebar-menu-collapse">
                     <Nav.Link role="button" className='sidebar-menu-collapse-item' onClick={() => setOpenSubMenu(!openSubMenu)} aria-expanded={openSubMenu}>
                        <span>Setup</span>
                     </Nav.Link>
                     <Collapse className="collapse-box" in={openSubMenu}>
                        <ul className="nav nav-sm flex-column mt-2">
                           {routes?.filter(function (arr) { return arr.isSetup; }).map((value, index) => {
                              if (value.isMenu && value.isSetup) {
                                 return <SideBarItem user={user} key={index} base="" {...value} className='w-100' />
                              }
                              return '';
                           })}
                        </ul>
                     </Collapse>
                  </Nav.Item>
               }
               {/* {favoritesTask.length > 0 && user.role.code !== databaseRoleCode.clientCode &&
                  <Nav.Item as="li" className="sidebar-menu-collapse">
                     <Nav.Link role="button" className='sidebar-menu-collapse-item' onClick={() => setOpenFavourite(!openFavourite)} aria-expanded={openFavourite}>
                        <span>Recent Favourite Task</span>
                     </Nav.Link>
                     <Collapse className="collapse-box " in={openFavourite}>
                        <ul className="nav nav-sm flex-column mt-2">
                           {favoritesTask.map((drp, index) => (
                              <li className="nav-item favorites-task-items" key={index}>
                                 <button type="button" className="btn-icon circle-btn btn btn-white btn-sm delete-task text-danger" onClick={() => handleAddRemoveFavorite(1, drp.taskId)}>
                                    <i className="icon-delete"></i>
                                 </button>
                                 <Link to={drp?.task_type === 1 ? `/view-site-addons-task/${drp.taskId}` : `/view-task/${drp.taskId}`} className="nav-link"><span className="color-icon white-color-icon"><span className="font-weight-semibold font-12 charchter-icon">{drp.task_name.charAt(0)}</span></span><span className="task-name">{drp.task_name}</span></Link>
                              </li>
                           ))}
                        </ul>
                     </Collapse>
                  </Nav.Item>
               } */}
            </SimpleBar>
         </Navbar.Collapse>
      </Navbar>
   );
}

const mapStateToProps = state => ({
   user: state.Auth.user,
   favoritesTask: state.App.favoritesTask,
})

export default connect(mapStateToProps)(Sidebar)
