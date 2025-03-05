import React from 'react';
import { Link } from "react-router-dom";

export default function SubscriptionLeftPanel({ activeMenu, userData }) {
    return (
        <aside className="card border border-gray-100 rounded-10 mb-xl-4">
            <div className="p-3 p-md-4 d-flex align-items-center">
                <h3 className="mb-1 ps-md-2">Quick Links</h3>
                <button className="navbar-toggler collapsed ms-auto d-block d-xl-none p-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav2" aria-controls="navbarNav2" aria-expanded="false" aria-label="Toggle navigation">
                    <svg className="menu-icon" data-name="icons/tabler/hamburger" xlinkHref="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                        <rect data-name="Icons/Tabler/Hamburger background" width="16" height="16" fill="none"></rect>
                        <path d="M15.314,8H.686A.661.661,0,0,1,0,7.368a.653.653,0,0,1,.593-.625l.093-.006H15.314A.661.661,0,0,1,16,7.368a.653.653,0,0,1-.593.626Zm0-6.737H.686A.661.661,0,0,1,0,.632.654.654,0,0,1,.593.005L.686,0H15.314A.661.661,0,0,1,16,.632a.653.653,0,0,1-.593.625Z" transform="translate(0 4)" fill="#1e1e1e"></path>
                    </svg>
                    <svg className="menu-close" data-name="icons/tabler/close" xlinkHref="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                        <rect data-name="Icons/Tabler/Close background" width="16" height="16" fill="none"></rect>
                        <path d="M.82.1l.058.05L6,5.272,11.122.151A.514.514,0,0,1,11.9.82l-.05.058L6.728,6l5.122,5.122a.514.514,0,0,1-.67.777l-.058-.05L6,6.728.878,11.849A.514.514,0,0,1,.1,11.18l.05-.058L5.272,6,.151.878A.514.514,0,0,1,.75.057Z" transform="translate(2 2)" fill="#1e1e1e"></path>
                    </svg>
                </button>
            </div>
            <div className="collapse navbar-collapse d-xl-block" id="navbarNav2">
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/plans/subscription" className={`${activeMenu === 'subscription' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Subscription</span></Link>
                    </li>
                    {/* <li>
                        <Link to="/plans/manage-dev-plans" className={`${activeMenu === 'manage-dev-plans' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Manage Dev Plans</span></Link>
                    </li>
                    <li>
                        <Link to="/plans/manage-site-add-ons" className={`${activeMenu === 'manage-site-add-ons' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Manage Site Add-ons</span></Link>
                    </li>
                    {(userData?.current_plan.includes("bucket") || userData?.current_plan === "none" || userData?.bucket_plan_status === 'active' || userData?.bucket_plan_status === 'in-active') ?
                        <li>
                            <Link to="/plans/manage-bucket-plan" className={`${activeMenu === 'manage-bucket-plans' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Manage Bucket Plans</span></Link>
                        </li>
                    : ''} */}
                    <li>
                        <Link to="/plans/upcoming-invoice" className={`${activeMenu === 'upcoming-invoice' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Upcoming Invoice</span></Link>
                    </li>
                    <li>
                        <Link to="/plans/past-invoice" className={`${activeMenu === 'past-invoice' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Past Invoice</span></Link>
                    </li>
                    <li>
                        <Link to="/plans/update-card" className={`${activeMenu === 'update-card' ? 'active' : ''}`}><span className="font-14 font-weight-normal dark-2">Update Card</span></Link>
                    </li>
                </ul>
            </div>
        </aside>

    );
}