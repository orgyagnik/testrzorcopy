import { combineReducers, legacy_createStore as createStore } from 'redux'
import Auth from "./reducers/Auth";
import App from "./reducers/App";

const Reducers = combineReducers({
    Auth,
    App,
})

const Store = createStore(Reducers)

export default Store;
