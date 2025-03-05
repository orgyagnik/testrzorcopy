import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {check} from "../../../utils/functions";
import { super_admin } from '../../../settings';


function PermissionCheck({children, permissions, userPermissions, userRoles, hasElse = false}) {
    const [hasPermissions, setHasPermissions] = useState(false)
    useEffect(() => {
        const hasRole = check([super_admin], userRoles);
        setHasPermissions(hasRole ? true : (permissions === undefined ? true : check(permissions, userPermissions)))
    }, [permissions, userPermissions, userRoles])

    return hasPermissions ? (children[0] !== undefined ? children[0] : children) : (hasElse ? (children[1] !== undefined ? children[1] : children) :
        <div/>)
}

const mapStateToProps = (state) => ({
    userPermissions: [...(state.Auth.user?.custom_permissions?.permissions ?? []), ...state.Auth.user.role?.getPermissions],
    userRoles: state.Auth.user.role,
})

export default connect(mapStateToProps)(PermissionCheck)