import React, { useState } from 'react';
import SearchIcon from "../../assets/img/icons/serach.svg";
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import AvatarImg from "../../assets/img/placeholder-image.png";
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { filterDropdownOptionByName, check } from "../../utils/functions.js";
import APIService from '../../api/APIService';
import { databaseRoleCode, popperConfig } from '../../settings';
import { Link } from 'react-router-dom';

export default function UpdateFollowers({ selectedFollower, setSelectedFollower, followerList, followerListForFilter, setFollowerListForFilter, taskId, userData, settings }) {
    const [followerSearch, setFollowerSearch] = useState('');
    const handleFollowerSearch = (value) => {
        setFollowerSearch(value);
        filterDropdownOptionByName(followerList, value, setFollowerListForFilter)
    }

    const onFollowerSelect = (e) => {
        handleFollowerSearch('');
        let id = parseInt(e);
        if (id > 0) {
            let addRemovechk = selectedFollower.filter(function (arr) { return arr.id === id; }).length > 0;
            if (!addRemovechk) {
                let newfollowerList = followerList.filter(function (arr) {
                    return arr.id === id;
                });
                setSelectedFollower(selectedFollower.concat(newfollowerList));
                let params = {};
                params["taskid"] = taskId;
                params["assign_followers"] = `${id}`;
                params["remove"] = 0;
                APIService.updateFollowers(params)
                    .then((response) => {
                        /*if (response.data?.status) {
                            setSelectedFollower(selectedFollower.concat(newfollowerList));
                        }*/
                    });
            }
            else {
                let newfollowerList = selectedFollower.filter(function (arr) {
                    return arr.id !== id;
                });
                setSelectedFollower(newfollowerList);
                let params = {};
                params["taskid"] = taskId;
                params["assign_followers"] = `${id}`;
                params["remove"] = 1;
                APIService.updateFollowers(params)
                    .then((response) => {
                        /*if (response.data?.status) {
                            setSelectedFollower(newfollowerList);
                        }*/
                    });
            }
        }
    };

    return (
        <div className="avatar-group flex-wrap">
            {selectedFollower && selectedFollower.map((assignUser, index) => (
                <span className="avatar avatar-sm avatar-circle" key={index}>
                    {userData.role_code !== databaseRoleCode.clientCode && userData.role_code !== databaseRoleCode.agencyCode && userData.role_code !== databaseRoleCode.agencyMemberCode ?
                        <Link to={`${assignUser.is_not_staff === 1 ? '/agency-user-detail/' : '/user-detail/'}${assignUser.id}`} target='_blank'>
                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                                {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                    <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = AvatarImg;
                                    }} />
                                    :
                                    <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                                }
                            </OverlayTrigger>
                        </Link>
                        :
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${index}`}> {assignUser.name}</Tooltip>}>
                            {assignUser.profile_image !== '' && assignUser.profile_image !== null ?
                                <img className="avatar-img" src={`${assignUser.profile_image}`} alt={assignUser.name} onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = AvatarImg;
                                }} />
                                :
                                <img className="avatar-img" src={AvatarImg} alt={assignUser.name} />
                            }
                        </OverlayTrigger>
                    }
                    {check(['tasks.update'], userData?.role.getPermissions) && (userData?.role_code !== databaseRoleCode.clientCode || settings?.edit_tasks === 1) ?
                        <OverlayTrigger placement="bottom" overlay={<Tooltip> Remove</Tooltip>}><span className="remove-task-user text-danger cursor-pointer" onClick={(e) => { onFollowerSelect(assignUser.id) }}><i className="fa fa-remove"></i></span></OverlayTrigger>
                        : ''}
                </span>
            ))}
            {check(['tasks.update'], userData?.role.getPermissions) && (userData?.role_code !== databaseRoleCode.clientCode || settings?.edit_tasks === 1) ?
                <span className="avatar avatar-sm avatar-circle">
                    <Dropdown className="assigned-drop-down dropdown" onSelect={onFollowerSelect} autoClose="outside" drop='up'>
                        <Dropdown.Toggle as="a" bsPrefix="no-toggle" className="dark-2 font-weight-medium font-12 cursor-pointer" id="assign"><img alt='Add User' className="avatar-img" src={AdddashedIcon} /></Dropdown.Toggle>
                        <Dropdown.Menu as="ul" align="end" className="p-2 w-100" popperConfig={popperConfig}>
                            <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                <div className="search-box w-100">
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                        <img src={SearchIcon} alt="Search" />
                                        <input type="search" className="form-control border-0" placeholder="Name" value={followerSearch} onChange={(e) => handleFollowerSearch(e.target.value)} />
                                    </div>
                                </div>
                            </Dropdown.Header>
                            <SimpleBar className="dropdown-body">
                                {followerListForFilter.map((drp, index) => (
                                    <Dropdown.Item as="li" key={index} eventKey={drp.id} className={`${selectedFollower && selectedFollower.filter(function (arr) {
                                        return arr.id === drp.id;
                                    }).length > 0 ? 'active' : ''}`}>
                                        <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                            {drp.profile_image !== '' && drp.profile_image !== null ?
                                                <img className="avatar avatar-xs avatar-circle me-1" src={`${drp.profile_image}`} alt={drp.name} onError={({ currentTarget }) => {
                                                    currentTarget.onerror = null;
                                                    currentTarget.src = AvatarImg;
                                                }} />
                                                :
                                                <img className="avatar avatar-xs avatar-circle me-1" src={AvatarImg} alt={drp.name} />
                                            }
                                            <div className="ps-3">
                                                <div className="font-weight-regular dark-1 font-14 d-block">{drp.name}</div>
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </SimpleBar>
                        </Dropdown.Menu>
                    </Dropdown>
                </span>
                : ''}
        </div>
    );
}
