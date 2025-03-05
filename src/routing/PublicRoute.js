import React from "react";
import { Redirect, Route } from "react-router-dom";
import { connect } from "react-redux";

const PublicRoute = ({ component: Component, ...rest }) => {
    return (
        <Route exact
            {...rest}
            render={props =>
                rest.isLoggedIn === false ? (
                    <Component {...props} {...rest} />
                ) : (
                    <Redirect
                        to={{ pathname: "/", state: { from: props.location } }}
                    />
                )
            }
        />
    );
};

const mapStateToProps = (state) => ({
    isLoggedIn: state.Auth.isLoggedIn
})

export default connect(mapStateToProps)(PublicRoute)
