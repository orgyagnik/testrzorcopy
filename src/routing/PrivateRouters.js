import React from "react";
import PrivateRoute from "./PrivateRoute";
import routes from "./routes";

const PrivateRouters = ({ component: Component, ...rest }) => {
    return routes.map(function (value, index) {
        return (
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
        );
    });
};

export default PrivateRouters
