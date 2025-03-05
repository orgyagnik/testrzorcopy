import React from 'react';
import devPlanImg from "../../assets/img/icons/dev-plan-icon-2.png";
import siteAddonPlanImg from "../../assets/img/icons/site-addon-icon-1.png";
import { Link } from "react-router-dom";
import { Button } from 'react-bootstrap';
import { databaseRoleCode } from '../../settings';

export default function PlanDetails({ userData }) {
  return (
    <div className="inner-content">
      <div className="plan-banner site-addon-banner">
        <div className="row">
          <div className="col-lg-12 text-center">
            {/* <h4>We Help Digital Agencies with:</h4> */}
            {/* <p className="descriptions">We offer <strong>Development Plan</strong> and <strong>Site Add-ons</strong> for the agencies who need ongoing development support (daily hours) or website specific maintenance, SEO, and Speed Optimization support respectively.</p> */}
            <h4>Important Announcement</h4> <br/>
            <div className="descriptions" style={{width: '100%', alignItems: 'center', display: 'block'}}>We are excited to announce that our company has been acquired by E2M Solutions. <br /> As part of this transition, we will be discontinuing our current Development Plans and Site Add-ons new purchase.</div>
            <p className="descriptions">To continue receiving top-notch support for your development needs, please visit <a href='https://www.e2msolutions.com/' target='_blank'>E2M Solutions. </a></p>
            <p className="descriptions">To know more about the development and maintenance plans, book a time on our calendar at:  <a href='https://calendly.com/hello-e2msolutions' target='_blank'> https://calendly.com/hello-e2msolutions.</a></p>
            {/* <p className="descriptions">Build your dedicated white label web design & Development team. <a href='https://www.e2msolutions.com/white-label/' target='_blank' rel="noreferrer"> Contact us</a> to schedule a call.</p> */}
          </div>
        </div>
        {/* <div className="row plan-row">
          <div className="col-lg-2 col-md-1"></div>
          <div className="col-lg-4 col-md-5 plan-col">
            <div className="plan-card">
              <div className="plan-card-content">
                <div className="plan-card-icon">
                  <img src={devPlanImg} alt="Dev plan" />
                </div>
                <h2>Development Plan</h2>
                <p>Unlimited WP tasks with daily developers hours to build new websites and support existing websites of all of your clients.</p>
                {userData?.current_plan.includes('dev') ?
                  <Button disabled={true} className="btn btn-danger btn-md text-uppercase">Already Subscribed</Button>
                  :
                  <>
                    {userData.role_code === databaseRoleCode.agencyCode &&
                      <Link className="btn btn-danger btn-md text-uppercase" to="/plans/manage-dev-plans">Shop Now</Link>
                    }
                    <a href="https://unlimitedwp.com/pricing/" target="_blank" rel="noreferrer" className="btn btn-success btn-md text-uppercase">Learn More</a>
                  </>
                }
                <br /><br />
                <p>You need WP developer to help you every day with anything WP</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-5 plan-col">
            <div className="plan-card">
              <div className="plan-card-content">
                <div className="plan-card-icon">
                  <img src={siteAddonPlanImg} alt="Site addons plan" />
                </div>
                <h2>Site Add-ons</h2>
                <p>Dedicated per website add-ons to easily upsell to your clients for WordPress Maintenance, SEO, and Speed Optimization.</p>
                {userData?.current_plan.includes('addons') ?
                  <Button disabled={true} className="btn btn-danger btn-md text-uppercase">Already Subscribed</Button>
                  :
                  <>
                    <a href="https://unlimitedwp.com/care-plans/" target="_blank" rel="noreferrer" className="btn btn-success btn-md text-uppercase">Care Addon</a>
                    <a href="https://unlimitedwp.com/wordpress-seo-plan/" target="_blank" rel="noreferrer" className="btn btn-success btn-md text-uppercase">Growth Addon</a>
                    <a href="https://unlimitedwp.com/wordpress-optimize-plan/" target="_blank" rel="noreferrer" className="btn btn-success btn-md text-uppercase">Optimize Addon</a>
                    {userData.role_code === databaseRoleCode.agencyCode &&
                      <Link className="btn btn-danger btn-md text-uppercase" to="/plans/manage-site-add-ons">Shop Now</Link>
                    }
                  </>
                }
                <br /><br />
                <p>You need help with maintenance, SEO, or Speed Optimization on specific websites</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
