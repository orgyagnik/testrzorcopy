const AuthState = {
    checked: false,
    user: {},
    isLoggedIn: false
}

export const setAuthChecked = () => {
    return {
        type: 'Auth/checked'
    }
}

export const setLoginTrue = () => {
    return {
        type: 'Auth/True'
    }
}

export const setLoginFalse = () => {
    return {
        type: 'Auth/False'
    }
}

export const saveUserObject = (user = null, loginStatus = true) => {
    return {
        type: 'Auth/User',
        val: user,
        loginStatus: loginStatus
    }
}

export default function Auth(state = AuthState, action) {
    switch (action.type) {
        case setLoginTrue().type:
            return { ...state, isLoggedIn: true };
        case setLoginFalse().type:
            return { ...state, isLoggedIn: false };
        case saveUserObject().type:
            return { ...state, user: action.val, isLoggedIn: action.loginStatus };
        default:
            return state;
    }
}

/*export const userForgotPassword = async (email) => {
    let result = {
        status: false,
        message: "",
        data: null
    };
    await forgot_password(email).then(response => {
        result = responseValidate(response)
    })
    return result;
}

export const userResetPassword = async (email, token, password, password_confirmation) => {
    let result = {
        status: false,
        message: "",
        data: null
    };
    await reset_password(email, token, password, password_confirmation).then(response => {
        result = responseValidate(response)
    })
    return result;
}

export const userChangePassword = async (password, new_password, password_confirmation) => {
    let result = {
        status: false,
        message: "",
        data: null
    };
    await change_password(password, new_password, password_confirmation).then(response => {
        result = responseValidate(response)
    })
    return result;
}*/