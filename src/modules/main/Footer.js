import React from 'react';

export default function Footer() {
  return (
    <footer className="pt-xl-8 mt-lg-1 bg-white">
      <div className="container-fluid py-2 px-lg-7">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="fs-16 text-gray-600 my-2">{new Date().getFullYear()} &copy; Razorcopy - All rights reserved.</p>
          </div>
          <div className="col-md-6">
            {/* <ul className="nav navbar">
              <li><a href="#0">About</a></li>
              <li><a href="#0">Support</a></li>
              <li><a href="#0">Contact</a></li>
            </ul> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
