const AppState = {
    allProjects: [],
    allClients: [],
    allMembers: [],
    repeatEveryListData: [],
    repeatEveryCustomListData: [],
    favoritesTask: [],
    notificationData: null,
}

export const setAllProjects = (allProjects = []) => {
    return {
        type: 'App/AllProjects',
        val: allProjects
    }
}

export const setFavoritesTask = (favoritesTask = []) => {
    return {
        type: 'App/FavoritesTask',
        val: favoritesTask
    }
}

export const setNotificationData = (notificationData = null) => {
    return {
        type: 'App/NotificationData',
        val: notificationData
    }
}

export default function Auth(state = AppState, action) {
    switch (action.type) {
        case setAllProjects().type:
            return {
                ...state,
                allProjects: {
                    ...state.allProjects,
                    allProjects: action.val
                }
            }
        case setFavoritesTask().type:
            return {...state, favoritesTask: action.val};
        case setNotificationData().type:
            return {...state, notificationData: action.val};
        default:
            return state;
    }
}