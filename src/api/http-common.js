import axios from "axios";
import { decryptToken } from "../utils/functions.js"
import NProgress from "nprogress/nprogress.js";
import { encryptToken } from "../utils/functions.js";
NProgress.configure({ easing: 'ease-out', speed: 500 });

let Authorization = "Bearer "
let token = localStorage.getItem("rz_access_token");
let headers = '';



if (token !== null) {
  Authorization = Authorization + decryptToken(token);
  headers = {
    "Content-type": "application/json",
    "Authorization": Authorization,
  };
}
else {
  headers = {
    "Content-type": "application/json"
  };
}

const Request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: headers
});

const RequestWithLoader = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: headers,
});

let Token = "Bearer "
let ref_token = localStorage.getItem("rz_refresh_token");
let ref_headers = '';

if (ref_token !== null) {
  Token = Token + decryptToken(ref_token);
  ref_headers = {
    "Content-type": "application/json",
    "Authorization": Token,
  };
}
else {
  ref_headers = {
    "Content-type": "application/json"
  };
}

const Token_Generate_Request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: ref_headers
});


const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total);

RequestWithLoader.defaults.onDownloadProgress = e => {
  const percentage = calculatePercentage(e.loaded, e.total)
  NProgress.set(percentage);
}

RequestWithLoader.interceptors.request.use(request => {
  NProgress.start();
  return request;
})

Request.interceptors.response.use(response => {
  if (response.data.name !== undefined) {
    if (response.data?.name === "TokenExpiredError") {
      Token_Generate_Request.post("/generate-token")
        .then((response1) => {
          if (response1.data.success) {
            localStorage.removeItem("rz_access_token");
            // localStorage.removeItem("rz_refresh_token");
            localStorage.setItem("rz_access_token", encryptToken(response1.data.access_token));
            // localStorage.setItem("rz_refresh_token", encryptToken(response1.data.refresh_token));
            window.location.reload();
          }
        })
        .catch((error) => {
          localStorage.removeItem("rz_user_role");
          localStorage.removeItem("rz_access_token");
          localStorage.removeItem("rz_refresh_token");
          localStorage.removeItem("accessToken_old");
          localStorage.removeItem("refreshToken_old");
          localStorage.removeItem("rz_user_role_old");
          window.location.reload();
        });
    }
  }
  if (response.data?.code === "503") {
    window.location.reload();
  }
  //for refresh token
  if (response.data?.status === 403) {
    Token_Generate_Request.post("/auth/generate-token")
      .then((response1) => {
        if (response1.data.success) {
          localStorage.removeItem("rz_access_token");
          // localStorage.removeItem("rz_refresh_token");
          localStorage.setItem("rz_access_token", encryptToken(response1.data.access_token));
          // localStorage.setItem("rz_refresh_token", encryptToken(response1.data.refresh_token));
          window.location.reload();
        }
      })
      .catch((error) => {
        localStorage.removeItem("rz_user_role");
        localStorage.removeItem("rz_access_token");
        localStorage.removeItem("rz_refresh_token");
        localStorage.removeItem("accessToken_old");
        localStorage.removeItem("refreshToken_old");
        localStorage.removeItem("rz_user_role_old");
        window.location.reload();
      });
  }
  return response;
})

RequestWithLoader.interceptors.response.use(response => {
  if (response.data.name !== undefined) {
    if (response.data?.name === "TokenExpiredError") {
      Token_Generate_Request.post("/generate-token")
        .then((response1) => {
          if (response1.data.success) {
            localStorage.removeItem("rz_access_token");
            // localStorage.removeItem("rz_refresh_token");
            localStorage.setItem("rz_access_token", encryptToken(response1.data.access_token));
            // localStorage.setItem("rz_refresh_token", encryptToken(response1.data.refresh_token));
            window.location.reload();
          }
        })
        .catch((error) => {
          localStorage.removeItem("rz_user_role");
          localStorage.removeItem("rz_access_token");
          localStorage.removeItem("rz_refresh_token");
          window.location.reload();
        });
    }
  }
  if (response.data?.code === "503") {
    window.location.reload();
  }
  //for refresh token
  if (response.data?.status === 4033) {
    Token_Generate_Request.post("/generate-token")
      .then((response1) => {
        if (response1.data.success) {
          localStorage.removeItem("rz_access_token");
          // localStorage.removeItem("rz_refresh_token");
          localStorage.setItem("rz_access_token", encryptToken(response1.data.access_token));
          // localStorage.setItem("rz_refresh_token", encryptToken(response1.data.refresh_token));
          window.location.reload();
        }
      })
      .catch((error) => {
        localStorage.removeItem("rz_user_role");
        localStorage.removeItem("rz_access_token");
        localStorage.removeItem("rz_refresh_token");
        localStorage.removeItem("accessToken_old");
        localStorage.removeItem("refreshToken_old");
        localStorage.removeItem("rz_user_role_old");
        window.location.reload();
      });
  }
  NProgress.done(true);
  return response;
})


export {
  Request,
  RequestWithLoader,
};