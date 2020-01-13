module.exports = {
	updateStorage: function(storage, data) {
		localStorage[storage] = JSON.stringify({ ...(this.getStorage(storage)), ...data });
	},

	getStorage: function(storage) {
		return localStorage[storage] ? JSON.parse(localStorage[storage]) : null;
	},

	deleteStorage: function(storage) {
		localStorage.removeItem(storage);
	},

	validEmail: function(email) {
		var re = /^[\w-]+(?:\.[\w\-]+)*(?:\+[\w\-]+)?@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/i;
		return re.test(email.trim());
	},

	loggedIn: function() {
		let jwt = this.getStorage('jwt');
		return !!jwt;
	},

	logout: function() {
		this.deleteStorage('jwt');
		this.deleteStorage('userInfo');
		window.history.pushState({}, '', '/');
	},

	handleAuthError: function(error) {
		switch (error) {
			case 401:
				this.logout();
				break;
		}
	},

	formToObject: (form) => {
		var data = new FormData(form);
		return Array.from(data.entries()).reduce((memo, pair) => ({ ...memo, [pair[0]]: pair[1] }), {});
	},

	formatCurrency: (number, currency = 'USD') => {
		return number.toLocaleString('US-EN', {style: 'currency', currency});
	},

	isUUID: (str) => {
		return str.match('[a-fA-F0-9]{32}');
	}
};
