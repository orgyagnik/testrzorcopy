import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { connect } from "react-redux";
import { check } from "../utils/functions";
import NoPermission from "../pages/auth/NoPermission";
import { super_admin } from '../settings';

function CheckPermission({ children, permissions, userPermissions, userRoles }) {
    const [hasRole, setHasRole] = useState(check([super_admin], userRoles))
    const [hasPermissions, setHasPermissions] = useState(hasRole ? true : (permissions === undefined ? true : check(permissions, userPermissions)))

    useEffect(() => {
        setHasRole(check([super_admin], userRoles));
    }, [userRoles])

    useEffect(() => {
        setHasPermissions(hasRole ? true : (permissions === undefined ? true : check(permissions, userPermissions)))
    }, [hasRole, permissions, userPermissions, userRoles])

    return hasPermissions ? children : <NoPermission />
}

const PrivateRoute = ({ component: Component, permissions: Permissions, userPermissions, userRoles, ...rest }) => {
    return (
        <Route exact
            {...rest}
            render={props =>
                rest.isLoggedIn === true ? (
                    <CheckPermission
                        permissions={Permissions}
                        userPermissions={userPermissions}
                        userRoles={userRoles}>
                        <Component {...props} {...rest} />
                    </CheckPermission>
                ) : (
                    <Redirect
                        to={{ pathname: "/login", state: { from: props.location } }}
                    />
                )
            }
        />
    );
};

const mapStateToProps = (state) => ({
    isLoggedIn: state.Auth.isLoggedIn,
    userPermissions: state.Auth.user.role?.getPermissions,
    userRoles: state.Auth.user.role,
})

export default connect(mapStateToProps)(PrivateRoute)
