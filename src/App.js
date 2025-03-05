import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SiteAddonRegister from './pages/auth/SiteAddonRegister';
import BucketPlanRegister from './pages/auth/BucketPlanRegister';
import ResetPassword from './pages/auth/ResetPassword';
import SetPassword from './pages/auth/SetPassword';
import Verification from './pages/auth/Verification';
import ForgotPassword from './pages/auth/ForgotPassword';
//import TestNotification from './pages/auth/TestNotification';
import 'react-dates/initialize';
import PublicRoute from "./routing/PublicRoute";
//import PrivateRouters from "./routing/PrivateRouters";
import APIService from "./api/APIService";
import { saveUserObject } from "./store/reducers/Auth";
import { setFavoritesTask, setNotificationData } from "./store/reducers/App";
import Store from "./store";
import { Spinner, Modal, CloseButton } from "react-bootstrap";
import './App.css';
import { decryptToken } from "./utils/functions.js";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Pusher from 'pusher-js/with-encryption';
import { databaseRoleCode, app_timezone } from './settings';
import ScrollToTop from "./ScrollToTop";
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import moment from 'moment';
import MaintenanceMode from "./MaintenanceMode";
import NotFound from "./pages/auth/NotFound";
import routes from "./routing/routes";
import PrivateRoute from "./routing/PrivateRoute";
import BirthdayText from "./assets/img/birthday-text.png";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PRIVATE_KEY);
const REACT_APP_PUSHER_KEY = process.env.REACT_APP_PUSHER_KEY;
const REACT_APP_TAWK_KEY = process.env.REACT_APP_TAWK_KEY;
const REACT_APP_MAINTENANCE_MODE = process.env.REACT_APP_MAINTENANCE_MODE;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [userDataForApp, setUserDataForApp] = useState([]);

  moment.tz.setDefault(app_timezone);
  let user_role_enc = localStorage.getItem("rz_user_role");
  // let birthdayWishesCookie = localStorage.getItem("birthday_wishes_cookie");

  useEffect(() => {
    if (REACT_APP_MAINTENANCE_MODE !== "on") {
      if (user_role_enc !== null) {
        let user_role = decryptToken(user_role_enc);
        let params = {};
        APIService.getLogedInUser(params, user_role)
          .then((response) => {
            if (response.data?.status) {
              setLoading(false);
              let userData = response.data?.data;
              setUserDataForApp(userData);
              Store.dispatch(saveUserObject(userData));
              // APIService.getFavavoriteTasks()
              //   .then((response) => {
              //     if (response.data?.status) {
              //       Store.dispatch(setFavoritesTask(response.data?.data));
              //       setLoading(false);
              //       let dobDate = moment(userData?.dob)._d;
              //       let dobDay = dobDate.getDate();
              //       let dobMonth = dobDate.getMonth() + 1;
              //       let todayDate = moment()._d;
              //       let todayDay = todayDate.getDate();
              //       let todayMonth = todayDate.getMonth() + 1;
              //       if (Math.abs(new Date() - new Date(birthdayWishesCookie)) / (1000 * 60 * 60) > 25 && userData?.role_code !== databaseRoleCode.clientCode && userData?.role_code !== databaseRoleCode.agencyCode && userData?.role_code !== databaseRoleCode.agencyMemberCode && dobDay === todayDay && dobMonth === todayMonth) {
              //         setShowBirthdayPopup(true);
              //         localStorage.setItem("birthday_wishes_cookie", new Date());
              //       }
              //     }
              //     else {
              //       setLoading(false);
              //     }
              //   });

              //migration api
              /*APIService.migrateAgencyName()
              .then((response) => {
                console.log(response.data);
              });*/

              if (userData?.role_code !== databaseRoleCode.clientCode) {
                // let params = "?limit=50&page=1&sort=desc&sort_by=id";
                // APIService.getNotification(params)
                //   .then((response) => {
                //     if (response.data?.status) {
                //       Store.dispatch(setNotificationData(response.data?.data));
                //     }
                //     else {
                //       Store.dispatch(setNotificationData([]));
                //     }
                //   });

                /* Pusher notification code */
                const pusher = new Pusher(REACT_APP_PUSHER_KEY, {
                  cluster: "ap2",
                  forceTLS: true
                });
                const channel = pusher.subscribe(`${userData?.environment}-notifications-channel-${userData?.id}`);
                channel.bind('client-message', function (data) {

                  let params = "?limit=50&page=1&sort=desc&sort_by=id";
                  APIService.getNotification(params)
                    .then((response) => {
                      if (response.data?.status) {
                        Store.dispatch(setNotificationData(response.data?.data));
                      }
                      else {
                        Store.dispatch(setNotificationData([]));
                      }
                    });

                  if (Notification.permission === "granted") {
                    showDesktopNotification(data);
                  } else if (Notification.permission !== "denied") {
                    Notification.requestPermission()
                      .then(permission => {
                        if (permission === "granted") {
                          showDesktopNotification(data);
                        }
                      })
                  }
                });
                /* ================= ======== */
              }

            }
            else {
              setLoading(false);
            }
          })
          .catch((error) => {
            setLoading(false);
          });
      }
      else {
        setLoading(false);
      }
    }
    else {
      setLoading(false);
    }
  }, []);

  function showDesktopNotification(data) {
    const myNotification = new Notification(data?.data?.title, {
      icon: data?.data?.profile_image,
      body: data?.data?.content,
    });

    // navigate to a URL
    myNotification.addEventListener('click', () => {
      window.open(data?.data?.click_link, '_blank');
    });

  }
  /* ====== Pusher notification code end ===== */


  if (loading)
    return <Spinner className='pageLoader' animation="border" variant="primary" />

  return (
    REACT_APP_MAINTENANCE_MODE === "on" ?
      <MaintenanceMode />
      :
      <>
        <Router>
          <ScrollToTop>
            <Elements stripe={stripePromise}>
              <Switch>
                <PublicRoute path='/login' component={Login} />
                <Route path='/dev-plan-checkout' component={Register} />
                <Route path='/site-addon-checkout' component={SiteAddonRegister} />
                <Route path='/bucket-plan-checkout' component={BucketPlanRegister} />
                <PublicRoute path='/forgot-password' component={ForgotPassword} />
                <PublicRoute path='/reset-password/:token' component={ResetPassword} />
                <PublicRoute path='/set-password/:token' component={SetPassword} />
                <PublicRoute path='/verification/:token' component={Verification} />
                <Route path='/admin' exact render={props =>
                  <Redirect
                    to={{ pathname: "/", state: { from: props.location } }}
                  />
                } />
                <Route path='/webmail' exact render={props => { window.location.replace('https://webmail.taskme.biz/'); }} />
                <Route path='/webmail:2096' exact render={props => { window.location.replace('https://webmail.taskme.biz/'); }} />
                {/* <PublicRoute path='/test-notification' component={TestNotification} /> */}
                {/* <PrivateRouters /> */}

                {routes.map((value, index) => (
                  <PrivateRoute
                    exact
                    key={index}
                    path={value.path}
                    component={value.component}
                    title={value.title}
                    name={value.name}
                    permissions={value.permissions}
                    settings_key={value.settings_key}
                  />
                ))}
                <Route path="*" component={NotFound} />
              </Switch>
            </Elements>
          </ScrollToTop>
        </Router>
        {user_role_enc !== null && window.location.href.includes("/dev-plan-checkout") !== true && window.location.href.includes("/site-addon-checkout") !== true && window.location.href.includes("/bucket-plan-checkout") !== true &&
          <TawkMessengerReact
            propertyId={REACT_APP_TAWK_KEY}
            widgetId="default" />
        }

        <Modal aria-labelledby="contained-modal-title-vcenter" className='birthday-modal' centered show={showBirthdayPopup} onHide={() => setShowBirthdayPopup(false)}>
          <Modal.Body className='rounded-0'>
            <CloseButton aria-label="Hide" variant="white" className='position-absolute' onClick={() => setShowBirthdayPopup(false)} />
            <div className="birthday-card" >
              <div className="birthday-card-content">
                <img src={BirthdayText} alt='birthday' />
                <h2>{`${userDataForApp?.firstname} ${userDataForApp?.lastname}`}</h2>
                <h4>May you have all the joy<br /> your heart can hold. Wishing you the happiest and <br />brightest day ever!</h4>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </>
  );
}