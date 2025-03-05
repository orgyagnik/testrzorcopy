import React, { useState, useEffect } from 'react';
import LastSeen from "../../modules/custom/LastSeen";
import moment from 'moment-timezone';
import { Dropdown, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AvatarImg from "../../assets/img/placeholder-image.png";
import ReactImageFallback from "react-image-fallback";
import SimpleBar from 'simplebar-react';
import APIService from "../../api/APIService";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { setNotificationData } from "../../store/reducers/App";
import Store from "../../store";
import { display_date_format_with_time } from '../../settings';

function Notification({ notificationData }) {
    const history = useHistory();
    const [markAllAsReadProcess, setMarkAllAsReadProcess] = useState(false);
    const [refreshDesign, setRefreshDesign] = useState(false);

    const handleNotificationClick = (id, isread, link = '') => {
        if (isread === 0) {
            const params = {};
            if (id === 0) {
                setMarkAllAsReadProcess(true);
                params['mark_as'] = 'all';
                APIService.markAllAsReadProcess(params)
                    .then((response) => {
                        if (response.data?.status) {
                            setMarkAllAsReadProcess(false);
                            let tempList = notificationData;
                            tempList.forEach(list => {
                                list.isread = 1;
                            });
                            Store.dispatch(setNotificationData(tempList));
                            setRefreshDesign(!refreshDesign);
                        }
                        else {
                            setMarkAllAsReadProcess(false);
                        }
                    });
            }
            else {
                params['mark_as'] = 'single';
                params['id'] = id;
                APIService.markAllAsReadProcess(params)
                    .then((response) => {
                        if (response.data?.status) {
                            setMarkAllAsReadProcess(false);
                            let tempList = notificationData;
                            tempList.forEach(list => {
                                if (id === list.id)
                                    list.isread = 1;
                            });
                            Store.dispatch(setNotificationData(tempList));
                            setRefreshDesign(!refreshDesign);
                            if (link !== '' && link !== undefined) {
                                history.push(`${link}#${id}`);
                            }
                        }
                    });
            }
        }
        else {
            if (link !== '' && link !== undefined) {
                history.push(`${link}#${id}`);
            }
        }
    }

    useEffect(() => {
    }, [refreshDesign]);

    return (
        <Dropdown className="grid-option ms-5 notification-dropdown">
            <Dropdown.Toggle as="a" className="text-dark mb-0 notification no-carret cursor-pointer">
                {/* <img alt='Notification' src={notificatonsImg} /> */}
                <span className="icon-notificatons dark-5 font-20"></span>
                {notificationData && notificationData.filter(function (arr) { return arr.isread === 0; }).length > 0 &&
                    // <sup className="status bg-danger">&nbsp;</sup>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger  font-normal notification-count">{notificationData.filter(function (arr) { return arr.isread === 0; }).length}<span className="visually-hidden">unread messages</span></span>

                }
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-end py-0">
                <Dropdown.Header className="d-flex align-items-center px-4 py-4 ">
                    <span className="font-18 font-weight-medium dark-1">Notification</span>
                    <span onClick={() => handleNotificationClick(0, 0)} className="btn btn-link  ms-auto font-12">
                        {
                            !markAllAsReadProcess && 'Mark all as read'
                        }
                        {
                            markAllAsReadProcess && <><Spinner size="sm" animation="border" className="me-1" /></>
                        }
                    </span>
                </Dropdown.Header>

                <SimpleBar className="dropdown-body">
                    {notificationData !== null ?
                        notificationData.length > 0 ? notificationData.map((notification, index) => (
                            <Dropdown.Item onClick={() => { handleNotificationClick(notification?.id, notification?.isread, notification?.link); }} className={`${notification?.isread === 0 ? 'text-wrap active' : 'text-wrap'}`} key={index}>
                                <div className="media">
                                    {notification.description !== "Task deadline reminder" &&
                                        <span className="d-flex align-items-center">
                                            <span className="avatar avatar-md avatar-circle me-2 d-flex align-items-center justify-content-center">
                                                {notification.profile_image !== '' && notification.profile_image !== null ?
                                                    <ReactImageFallback
                                                        src={`${notification.profile_image}`}
                                                        fallbackImage={AvatarImg}
                                                        initialImage={AvatarImg}
                                                        alt={notification.name}
                                                        className="avatar-img"
                                                    />
                                                    :
                                                    <img src={AvatarImg} alt={notification.name} className="avatar-img" />
                                                }
                                            </span>
                                        </span>
                                    }
                                    <div className="media-body ps-1">
                                        {notification.description === "Task deadline reminder" ?
                                            <span className="d-flex align-items-center mb-2">
                                                <span className="font-14 font-weight-medium tiny dark-4">{`${notification.description} ${notification.additional_data ? ` - ${notification.additional_data}` : ''}`}</span>
                                            </span>
                                            :
                                            <span className="d-flex align-items-center mb-2">
                                                <span className="font-14 font-weight-medium tiny dark-4">{`${notification.name} - ${notification.description} ${notification.additional_data ? ` - ${notification.additional_data}` : ''}`}</span>
                                            </span>
                                        }
                                        {/* <span className="font-14 font-weight-medium dark-2 d-block mb-2">{`${notification.name} - ${notification.description}`}</span> */}
                                        <span className="font-12 font-weight-medium tiny dark-6 d-block">
                                            <OverlayTrigger placement="right" overlay={<Tooltip id={`tooltip-${notification.id}`}> {moment(notification.date).format(display_date_format_with_time)}</Tooltip>}>
                                                <span href="#" className="commnets-time dark-7 ms-md-2 font-12 mt-1 text-nowrap d-md-inline-block d-block">
                                                    <LastSeen date={Date.parse(moment(notification.date).format())} />
                                                </span>
                                            </OverlayTrigger>
                                        </span>
                                    </div>
                                </div>
                            </Dropdown.Item>
                        ))
                            :
                            <>
                                <Dropdown.Item className='d-inline-block text-center'>
                                    <p>Notification not found</p>
                                </Dropdown.Item>
                            </>
                        :
                        <>
                            <Dropdown.Item className='d-inline-block text-center'>
                                <Spinner size="md" animation="border" className="me-1" />
                            </Dropdown.Item>
                        </>
                    }
                </SimpleBar>
                <div className="dropdown-footer text-center py-2 border-top border-gray-100">
                    <Link to="/notification" className="btn btn-link link-dark my-2 font-14">View all <i className="fa-solid fa-chevron-right ms-2"></i></Link>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

const mapStateToProps = (state) => ({
    notificationData: state.App.notificationData,
})

export default connect(mapStateToProps)(Notification)