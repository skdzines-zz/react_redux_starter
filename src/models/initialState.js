module.exports = {
	userInfo: localStorage.userInfo ? JSON.parse(localStorage.userInfo) : null,
	jwt: localStorage.jwt ? JSON.parse(localStorage.jwt) : null,
};
