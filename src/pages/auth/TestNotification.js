import React, { useEffect } from 'react';
import Pusher from 'pusher-js/with-encryption';
import { Button } from 'react-bootstrap';
import APIService from '../../api/APIService';

const REACT_APP_PUSHER_KEY = "b2d8f981c41106d545cc";

export default function TestNotification() {
  useEffect(() => {
    const pusher = new Pusher(REACT_APP_PUSHER_KEY, {
      cluster: "ap2",
      forceTLS: true
    });
    const channel = pusher.subscribe(`notifications-channel`);
    channel.bind('client-message', function (data) {
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
  }, []);

  function showDesktopNotification(data) {
    new Notification(data?.notification, {
      //icon: data?.data?.profile_image,
      body: data?.notification,
    });

    // navigate to a URL
    /*myNotification.addEventListener('click', () => {
      window.open(data?.data?.click_link, '_blank');
    });*/

  }

  const sendNotification = () => {
    let params = {};
    params["notification"] = "test notification";
    APIService.sendTestNotification(params)
      .then((response) => {
        console.log(response.data?.message);
      });
  }

  return (
    <Button variant="soft-secondary" className='mt-10 ms-10' size="md" type="button" onClick={sendNotification}>Send Notification</Button>
  );
}
