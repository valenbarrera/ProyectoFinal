import axios from "axios";
import api from '../api/'

module.exports = {
    login: function (username, password, callback) {
        this.getToken(username, password, (response) => {
            if (response.success) {
                localStorage.token = response.token; 
                localStorage.permisos = JSON.stringify(response.permisos);
                if (callback) callback({
                    "success": true
                });
            } else {
                if (callback) callback({
                    "success": false,
                    "errors": response.errors
                });
            }
        })
    },

    logout: function () {
        axios.post(api.authLogout, {
                Token: localStorage.token
            })
            .then(function (response) {
                delete localStorage.token;
                delete localStorage.permisos;
                window.location.reload();
            })
            .catch(function (e) {
                console.log("auth", e);
            })
    },

    isLoggedIn: async function () {
        if (typeof (localStorage.token) != "undefined") {
            var response = await this.checkToken(localStorage.token);
            if (response.success) {
                this.updatePermission(localStorage.token);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    checkToken: async function (token) {
    const self = this;
        return await axios.post(api.authCheck, { Token: token })
            .then(function (response) {
                if (response.data.success) {
                    if (response.data.permisos) {
                        localStorage.permisos = JSON.stringify(response.data.permisos);
                    }
                    return { success: true };
                } else {
                    return { success: false };
                }
            })
            .catch(function (e) {
                if (e.response && e.response.status == 401) {
                    self.logout();
                }
                return { success: false };
            })
    },

    token: function () {
        return localStorage.token;
    },

    header: function () {
        return {
            headers: {
                "Authorization": "Token " + localStorage.token,
            },
        };
    },

    fileFormHeader: function () {
        return {
            headers: {
                "Authorization": "Token " + localStorage.token,
                "Content-Type": "multipart/form-data"
            },
            async: false,
            cache: false,
            contentType: false,
            processData: false,
        };
    },

    updatePermission: function(token) {
        const self = this;
        axios.post(api.authCheck, { Token: token })
            .then(function (response) {
                if (response.data.success && response.data.permisos) {
                    localStorage.permisos = JSON.stringify(response.data.permisos);
                }
            })
            .catch(function (e) {
                console.log("Error updating permissions", e);
            });
    },

    getToken: function (username, password, callback) {
        axios.post(api.auth, {
                username: username,
                password: password
            })
            .then(function (response) {
                if (response.status == 200) {
                    if (response.data.iduser) localStorage.iduser = response.data.iduser
                    localStorage.display = response.data.display;
                    response.data.token = response.data.token;
                    if (callback) callback(response.data);
                } else
                if (callback) callback({
                    "success": false
                })
            })
            .catch(function (e) {
                if (callback) callback({
                    "success": false
                })
            })
    },

    hasPermission: function(permissionName) {
        try {
            if (typeof localStorage.permisos !== "undefined") {
                const permisos = JSON.parse(localStorage.permisos);
                return permisos.includes(permissionName);
            }
            return false;
        } catch (e) {
            return false;
        }
    },
};