import React, { useState, useEffect, useRef } from 'react';
import SidebarLogo from "../../assets/img/logo/taskme-logo-black.png";
//import SearchIcon from "../../assets/img/icons/serach.svg";
import hamburgerOpen from "../../assets/img/icons/hamburger1.svg";
import hamburgerClose from "../../assets/img/icons/close1.svg";
import { Dropdown } from 'react-bootstrap';
import APIService from "../../api/APIService";
import { Link } from "react-router-dom";
import { setLoginFalse } from "../../store/reducers/Auth";
import Store from "../../store";
import Toast from './Toast';
import { connect } from "react-redux";
//import AddTaskModal from '../../pages/task/AddTaskModal';
import DefaultProfile from "../../assets/img/placeholder-image.png";
//import PermissionCheck from "../../modules/Auth/PermissionCheck";
import Notification from "./Notification";
import ReactImageFallback from "react-image-fallback";
import { databaseRoleCode, globalSearchAllowedPaths } from '../../settings';
import { capitalizeFirst, replaceSpecialCharacters } from "../../utils/functions.js"
import SimpleBar from 'simplebar-react';
import linkifyHtml from 'linkify-html';

function Header({ userData, pagename, headerFilterButton }) {

  /*const [showAddtaskModal, setShowAddtaskModal] = useState(false);
  const cstShowAddtaskModal = () => setShowAddtaskModal(true);*/
  const profile_img = userData?.profile_image !== null ? `${userData?.profile_image}` : DefaultProfile;
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [searchRecordNotFound, setSearchRecordNotFound] = useState(true);
  const [openSearchBar, setOpenSearchBar] = useState(false);
  const [noticeText, setNoticeText] = useState();
  const [noticeStartTime, setNoticeStartTime] = useState();
  const [noticeEndTime, setNoticeEndTime] = useState();
  const [showNotice, setShowNotice] = useState(false);
  const ref = useRef();
  const currentURL = window.location.pathname;
  
  function getDrawerPosition() {
    const position = localStorage.getItem("drawerPosition");
    return position !== null ? (position === "true") : true;
  }

  function setDrawerPosition(position) {
    localStorage.setItem("drawerPosition", position)
  }

  const [menuSidebarState, updateMenuSidebarState] = useState({
    isMenuSidebarCollapsed: getDrawerPosition()
  });
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  const isMobile = width <= 992;

  const logoutUser = async () => {
    APIService.logoutApi().then(() => {
      Store.dispatch(setLoginFalse());
      localStorage.removeItem("rz_access_token");
      localStorage.removeItem("rz_refresh_token");
      localStorage.removeItem("rz_user_role");
      localStorage.removeItem("accessToken_old");
      localStorage.removeItem("refreshToken_old");
      localStorage.removeItem("rz_user_role_old");
      window.location.reload();
    })
  }

  const toggleMenuSidebar = () => {
    const position = !menuSidebarState.isMenuSidebarCollapsed;
    setDrawerPosition(position)
    updateMenuSidebarState({
      isMenuSidebarCollapsed: position
    });
  };

  const fetchSearchResult = () => {
    let params = "?search=" + search;
    APIService.gloablSearch(params)
      .then((response) => {
        if (response.data?.status) {
          let searchData = response.data?.data;
          let recordCounter = 0;
          setSearchResult(searchData);
          searchData.map(item => {
            if (item.result.length > 0) {
              recordCounter = recordCounter + 1;
            }
            return true;
          });
          if (recordCounter > 0) {
            setSearchRecordNotFound(false);
          }
          else {
            setSearchRecordNotFound(true);
          }
        }
        else {
          setSearchRecordNotFound(true);
        }
      });
  }

  useEffect(() => {
    document.title = pagename;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current) {
        if (!ref.current.contains(event.target)) {
          setOpenSearchBar(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, [ref]);

  useEffect(() => {
    if (search.length > 2) {
      const timer = setTimeout(() => {
        fetchSearchResult();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [search]);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    if (menuSidebarState.isMenuSidebarCollapsed) {
      document.querySelector('body').classList.remove('sidebar-menu');
    } else {
      document.querySelector('body').classList.add('sidebar-menu');
    }
    /* if (isMobile) {
      if (menuSidebarState.isMenuSidebarCollapsed) {
        document.querySelector('body').classList.remove('sidebar-menu');
      } else {
        document.querySelector('body').classList.add('sidebar-menu');
      }
    }
    else {
      if (menuSidebarState.isMenuSidebarCollapsed) {
        document.querySelector('body').classList.remove('sidebar-icons');
      } else {
        document.querySelector('body').classList.add('sidebar-icons');
      }
    } */
  }, [isMobile, menuSidebarState.isMenuSidebarCollapsed]);

  // useEffect(() => {
  //   // Function to fetch data from the get today notice API
  //   const checkNoticeExist = async () => {
  //     let params = '';
  //     APIService.getTodayNotice(params)
  //       .then((response) => {
  //         if (response.data?.status) { 
            
  //           setNoticeText(<p className='display-notice' dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(response?.data?.data[0].message !== undefined && response?.data?.data[0].message !== "undefined" ? response?.data?.data[0].message : '<p class="text-muted"></p>')).replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></p>);
            
  //           // const scheduledTime = new Date(response?.data?.data[0]?.start_date); // Replace with your scheduled time
  //           const scheduledTime = topNoticeAlretDateConvert(response?.data?.data[0]?.start_date);
  //           const currentTime = new Date(); 
  //           const timeUntilNotice = scheduledTime - currentTime;

  //           // const scheduledEndTime = new Date(response?.data?.data[0]?.end_date); 
  //           const scheduledEndTime = topNoticeAlretDateConvert(response?.data?.data[0]?.end_date); 
  //           const timeEndNotice = scheduledEndTime - currentTime;
            
  //           setTimeout(() => {
              
  //             document.querySelector('body').classList.add('top-alert-notification');
  //             setTimeout(() => { 
  //               let bgColor = response?.data?.data[0]?.bg_color ? response?.data?.data[0]?.bg_color : '#EC4141';
  //               document.getElementById('top-alert').style.backgroundColor = bgColor;
  //               document.getElementById('top-alert').style.opacity = 1;
  //             },50);
              
  //             setShowNotice(true);
  //           }, timeUntilNotice);  

  //           setTimeout(() => {
  //             setShowNotice(false);
  //             document.querySelector('body').classList.remove('top-alert-notification');
  //           }, timeEndNotice);  
  //         }
  //         else {
  //           setShowNotice(false); 
  //           document.querySelector('body').classList.remove('top-alert-notification');
  //         }
  //     });
  //   };

  //   // Use setTimeout to delay the API call by 30 seconds (30000 milliseconds)
  //   const timeoutId = setTimeout(checkNoticeExist, 300);

  //   // Cleanup function to cancel the timeout if the component unmounts
  //   return () => clearTimeout(timeoutId);
  // }, []);

  const handleSearchChange = async (e) => {
    setSearch(e.target.value);
    setOpenSearchBar(true);
    if (e.target.value === '') {
      setSearchResult([]);
    }
  };


  const handleMobileSearchClick = async (e) => {
    document.querySelector('body').classList.add('search-box-open');
  }
  const handleCloseMobileSearchClick = async (e) => {
    setSearch('');
    document.querySelector('body').classList.remove('search-box-open');
  }


  const topNoticeAlretDateConvert = (dateString) => {
    // const dateString = "2023-09-28 03:45 PM";

    const [datePart, timePart, period] = dateString.split(' ');

    const [time] = timePart.split(' ');
    const [hours, minutes] = time.split(':');
    
    const [year, month, day] = datePart.split('-');
    
    let hourValue = parseInt(hours);

    if (period === 'PM' && hourValue !== 12) {
      hourValue += 12;
    } else if (period === 'AM' && hourValue === 12) {
      hourValue = 0;
    }
    
    const convertedDate = new Date(year, month - 1, day, hourValue, minutes);
    
    return convertedDate;
  }
  
  const allClearCache = () => {
    let params = {};
    APIService.allClearCache(params)
      .then((response) => {
        if (response.data?.status) { 
          window.location.reload();
        }else {
        }
      });
  }

  return (
    <>
      <div className="header header-fixed">
        {/* Top Alert Message Start  @Devloper if start this alert so please add "top-alert-notification" in body. */}
        { showNotice ?
          <div className="top-alert" id="top-alert">
              <span>
                <i className="fa fa-bullhorn" aria-hidden="true"></i> {noticeText} 
              </span>
          </div> 
          :
          <>  
          </> 
        }
        {/* Top Alert Message End*/}

        <div className="container-fluid px-0">
          <div className="header-body">
            <div className="row align-items-center">
              <span onClick={() => toggleMenuSidebar()} className="muze-hamburger d-lg-none d-block col-auto">
                <img src={hamburgerOpen} alt="Open Icon" />
                <img src={hamburgerClose} className="menu-close" alt="Close Icon" />
              </span>
              <Link className="navbar-brand me-auto ms-3 d-lg-none col-auto px-0" to="#">
                <img src={SidebarLogo} alt="Taskme" />
              </Link>
              <div className="col d-xl-flex d-none align-items-center ">
                {/* <a href="#" onClick={() => toggleMenuSidebar()} className="back-arrow bg-white circle circle-sm shadow border border-gray-200 rounded mb-0"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16">
              <g data-name="icons/tabler/chevrons-left" transform="translate(0)">
                <rect data-name="Icons/Tabler/Chevrons Left background" width="16" height="16" fill="none"/>
                <path d="M14.468,14.531l-.107-.093-6.4-6.4a.961.961,0,0,1-.094-1.25l.094-.107,6.4-6.4a.96.96,0,0,1,1.451,1.25l-.094.108L10,7.36l5.72,5.721a.961.961,0,0,1,.094,1.25l-.094.107a.96.96,0,0,1-1.25.093Zm-7.68,0-.107-.093-6.4-6.4a.961.961,0,0,1-.093-1.25l.093-.107,6.4-6.4a.96.96,0,0,1,1.45,1.25l-.093.108L2.318,7.36l5.72,5.721a.96.96,0,0,1,.093,1.25l-.093.107a.96.96,0,0,1-1.25.093Z" transform="translate(0 1)" fill="#6C757D"/>
              </g>
            </svg>
            </a> */}
                <h2 className="my-0">{pagename}</h2>

              </div>
              <div className="col-auto d-flex flex-wrap align-items-center blue-hover-icon ps-0 ms-auto">
                {/* <PermissionCheck permissions={['tasks.create']}>
                <Button variant="primary" type="button" className="btn-icon circle-btn ms-3" onClick={cstShowAddtaskModal}><i className="icon-add"></i></Button>
              </PermissionCheck> */}
                {/* {userData?.environment && userData?.environment !== 'production' &&
                  <div className="col d-lg-flex d-none align-items-center ">
                    <h2 className="my-0 text-danger me-2">{capitalizeFirst(userData?.environment)}</h2>
                  </div>
                } */}
                {userData?.role_code === databaseRoleCode.adminCode &&
                  <div className="grid-option ms-5 cache-dropdown dropdown">
                    <a className="text-dark mb-0 cache no-carret cursor-pointer dropdown-toggle" id="react-aria4849463396-1" aria-expanded="false" onClick={() => { allClearCache() }}>
                      <span className="icon-rotate-right dark-5 font-20"></span>
                    </a>
                  </div>
                }
                <div className="d-md-none ms-5 search-toggle-mobile cursor-pointer" onClick={handleMobileSearchClick}>
                  <span className="icon-serach dark-5 font-20"></span>
                </div>
                {userData.role.code !== databaseRoleCode.clientCode &&
                  <>      
                    {(globalSearchAllowedPaths.some(path => currentURL.startsWith(path)) === true) &&            
                      <div className="header-search-box ms-md-5 d-md-block">
                        <div className="search-input" ref={ref}>
                          <input type="search" className="form-control rounded-40" placeholder="Search..." value={search} onChange={handleSearchChange} />
                          {searchResult.length > 0 && openSearchBar &&
                            <div className='search-result'>
                              <SimpleBar className="search-result-body">
                                {searchRecordNotFound ?
                                  <h5 className='text-center'>No results found</h5>
                                  :
                                  searchResult.map((result, resultIndex) => (
                                    <div key={resultIndex}>
                                      {result?.result.length > 0 &&
                                        <>
                                          <div className='search-list'>
                                            <h5>{capitalizeFirst(result?.type)}</h5>
                                            <ul>
                                              {result?.result?.map((res, resIndex) => (
                                                <li key={`${resultIndex}-${resIndex}`}><Link onClick={handleCloseMobileSearchClick} to={res?.link}>{res?.name}</Link></li>
                                              ))}
                                            </ul>
                                          </div>
                                        </>
                                      }
                                    </div>
                                  ))
                                }
                              </SimpleBar>
                            </div>
                          }
                        </div>
                        <div className="search-close-mobile ms-3 d-md-none" onClick={handleCloseMobileSearchClick}>
                          <span className="icon-cancel dark-5 font-14"></span>
                        </div>
                      </div>
                    }

                    <Notification />
                  </>
                }

                <Dropdown className="profile-dropdown ms-5">
                  <Dropdown.Toggle as="a" className="avatar avatar-sm avatar-circle no-carret cursor-pointer">
                    {/* <img className="avatar-img" src={profile_img} alt={`${userData?.firstname} ${userData?.lastname}`} /> */}
                    <ReactImageFallback
                      src={`${profile_img}`}
                      fallbackImage={DefaultProfile}
                      initialImage={DefaultProfile}
                      alt={`${userData?.firstname} ${userData?.lastname}`}
                      className="avatar-img" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-end" as="ul">
                    <li className="pt-3 pb-4 px-4 d-flex align-items-center">
                      <span className="avatar avatar-md avatar-circle">
                        <ReactImageFallback
                          src={`${profile_img}`}
                          fallbackImage={DefaultProfile}
                          initialImage={DefaultProfile}
                          alt={`${userData?.firstname} ${userData?.lastname}`}
                          className="avatar-img" />
                      </span>
                      <span className="ps-2">
                        <span className="fs-14 font-weight-medium dark-1">{`${userData?.firstname} ${userData?.lastname}`}</span>
                        <small className="dark-3 d-block">{userData?.email}</small>
                        {(userData.role.code === databaseRoleCode.agencyCode || userData.role.code === databaseRoleCode.agencyMemberCode) && userData?.agency_name ?
                          <span className='font-12 d-block mt-1'><b>Agency</b>: {userData?.agency_name}</span>
                          : ''
                        }
                      </span>
                    </li>
                    <li><hr className="dropdown-divider mt-0" /></li>
                    <li>
                      <Link to="/profile" className='text-wrap dropdown-item'>
                        <span className='me-3'>Profile</span>
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Dropdown.Item onClick={() => { logoutUser() }} className="text-wrap" ><span>Logout</span></Dropdown.Item>
                    </li>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>

        </div>
        {/* <AddTaskModal showAddtaskModal={showAddtaskModal} setShowAddtaskModal={setShowAddtaskModal} /> */}
      </div>

      <div className='page-title-mobile d-flex align-items-center d-xl-none py-4 px-4'>
        <h2 className="my-0">{pagename}</h2>
        {headerFilterButton && headerFilterButton}
      </div>
      <Toast />
    </>
  );
}

const mapStateToProps = (state) => ({
  userData: state.Auth.user
})

export default connect(mapStateToProps)(Header)