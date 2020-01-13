import { combineReducers } from 'redux';
import creator from 'common/creator';
import axios from 'axios';

const API_FETCH_BEGIN = 'api/beginFetch';
const API_FETCH_END = 'api/endFetch';

const API_LEGACY_POST = 'api/legacyPost';
const API_FORM_SUBMIT = 'api/formSubmit';
const API_REST_CREATE = 'api/REST_create';
const API_REST_READ = 'api/REST_read';
const API_REST_UPDATE = 'api/REST_update';
const API_REST_DELETE = 'api/REST_delete';
const API_UPLOAD = 'api/upload';


export const action = {
	legacyPost: creator.action.callable(API_LEGACY_POST), // url, data, onSuccess, onError
	submitForm: creator.action.callable(API_FORM_SUBMIT), // url, form, onSuccess, onError
	submitJson: creator.action.callable(API_REST_CREATE), // url, data, onSuccess, onError
	add: creator.action.callable(API_REST_CREATE), // url, data, onSuccess, onError
	get: creator.action.callable(API_REST_READ), // url, onSuccess, onError
	edit: creator.action.callable(API_REST_UPDATE), // url, data, onSuccess, onError
	remove: creator.action.callable(API_REST_DELETE), // url, onSuccess, onError
	upload: creator.action.callable(API_UPLOAD), // url, formData, onSuccess, onError
};

const increment = state => state + 1;
const decrement = state => state - 1;

export const reducer = combineReducers({
	activeRequests: creator.reducer.fromObject({
		[API_FETCH_BEGIN]: increment,
		[API_FETCH_END]: decrement,
	}, 0)
});

const defaultFetchOptions = {
	mode: 'cors',
	cache: 'no-cache',
	// credentials: 'include',
	credentials: 'same-origin',
};

function handleJSONResponse(response) {
	return response.text().then(
		(text) => {
			let ret = null;
			if (text.trim().indexOf('{') === 0) {
				ret = { ...(text && JSON.parse(text) || {}) };
			} else {
				// I suppose if it's not an object, default to making/treating it as an array of text in case it's not valid
				ret = [ ...(text && JSON.parse(text) || []) ];
			}
			ret.response = {
				statusText: response.headers.get('X-Status-Message') || response.statusText,
				message: response.headers.get('X-Status-Message') || response.statusText,
				status: response.status,
				success: response.ok
			};
			if (!response.ok) {
				return Promise.reject(ret);
			}
			return ret;
		}
	);
}

export const middleware = creator.middleware.fromObject({
/* deprecated */
	[API_LEGACY_POST]: (dispatch, action, getState) => {
		const { url, data, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		let entries = [];

		if (data instanceof FormData) {
			entries = data.entries();
		} else {
			entries = Object.entries(data || {});
		}

		const state = getState();

		const headers = new Headers({
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json',
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});

		return fetch(url, {
			...defaultFetchOptions,
			method: 'POST',
			headers,
			body: entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
			...(action.override || {})
		}).then(response => response.json())
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
/* end deprecated */
	[API_FORM_SUBMIT]: (dispatch, action, getState) => {
		const { url, form, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();

		const headers = new Headers({
			'Content-Type': 'multipart/form-data',
			'Accept': 'application/json',
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});

		return fetch(url, {
			...defaultFetchOptions,
			method: 'POST',
			headers,
			body: (form instanceof FormData) ? form : new FormData(form),
			...(action.override || {})
		}).then(handleJSONResponse)
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
	[API_REST_CREATE]: (dispatch, action, getState) => {
		const { url, data, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();

		const headers = new Headers({
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});

		return fetch(url, {
			...defaultFetchOptions,
			method: 'POST',
			headers,
			body: JSON.stringify(data),
			...(action.override || {})
		}).then(handleJSONResponse)
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
	[API_REST_READ]: (dispatch, action, getState) => {
		const { url, data, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();

		const headers = new Headers({
			'Accept': 'application/json',
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});
		const fetchUrl = new URL(url);
		if(data && !Array.isArray(data)) {
			Object.entries(data).forEach((entries) => fetchUrl.searchParams.append(...entries));
		}

		return fetch(fetchUrl, {
			...defaultFetchOptions,
			method: 'GET',
			headers,
			...(action.override || {})
		}).then(handleJSONResponse)
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
	[API_REST_UPDATE]: (dispatch, action, getState) => {
		const { url, data, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();

		const headers = new Headers({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});

		return fetch(url, {
			...defaultFetchOptions,
			method: 'PATCH',
			headers,
			body: JSON.stringify(data),
			...(action.override || {})
		}).then(handleJSONResponse)
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
	[API_REST_DELETE]: (dispatch, action, getState) => {
		const { url, onSuccess, onError } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();

		const headers = new Headers({
			...(state && state.authentication && state.authentication.jwt && state.authentication.jwt.token
				?	{ 'Authorization': 'Bearer ' + state.authentication.jwt.token }
				:	{}
			)
		});

		return fetch(url, {
			...defaultFetchOptions,
			method: 'DELETE',
			headers,
			...(action.override || {})
		}).then(handleJSONResponse)
			.then(payload => {
				return dispatch({ type: onSuccess, payload });
			})
			.catch(payload => {
				return dispatch({ type: onError, payload });
			})
			.finally(() => dispatch({ type: API_FETCH_END }));
	},
	[API_UPLOAD]: (dispatch, action, getState) => {
		const { url, data, onSuccess, onError, onProgress } = action;

		dispatch({ type: API_FETCH_BEGIN });

		const state = getState();
		// let percentCompleted = 0;
		let shortId = null;
		let batchId = null;
		for (var value of data.formData.values()) {
		   batchId = value.batchId;
		   shortId = value.shortId;
		}

		axios.defaults.headers.common['Authorization'] = state && state.authentication && state.authentication.jwt && state.authentication.jwt.token ? 'Bearer ' + state.authentication.jwt.token : {};
		axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';

		return axios({
			url,
			method: 'POST',
			data: data.formData,
			onUploadProgress: function(progressEvent) {
				dispatch({type: onProgress, payload: {batchId, shortId, loaded: progressEvent.loaded, total: progressEvent.total}});
		    }
		}).then((res) => {
			return {
				...res.data,
				response: {
					statusText: res.headers.get('X-Status-Message') || res.statusText,
					message: res.headers.get('X-Status-Message') || res.statusText,
					status: res.status,
					success: true
				}
			}
		}).then(payload => {
			payload.shortId = shortId;
			// payload.percentCompleted = percentCompleted;
			dispatch({ type: onSuccess, payload});
		}).catch(payload => dispatch({ type: onError, payload }))
	},
});
