import { combineReducers } from 'redux';

import creator from 'common/creator';
import methods from 'common/methods';

import { action as apiAction } from './api';
import { action as storeAction } from 'store';

import { API_HOST_V2 as API_URL } from 'config';
import { userInfo, jwt } from 'models/initialState';

const LOGIN = 'authentication/LOGIN';
const LOGIN_SUCCESS = 'authentication/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'authentication/LOGIN_FAILURE';

const FORGOT_PASSWORD = 'authentication/FORGOT_PASSWORD';
const FORGOT_PASSWORD_SUCCESS = 'authentication/FORGOT_PASSWORD_SUCCESS';
const FORGOT_PASSWORD_FAILURE = 'authentication/FORGOT_PASSWORD_FAILURE';

const RESET_PASSWORD = 'authentication/RESET_PASSWORD';
const RESET_PASSWORD_SUCCESS = 'authentication/RESET_PASSWORD_SUCCESS';
const RESET_PASSWORD_FAILURE = 'authentication/RESET_PASSWORD_FAILURE';

const VALIDATE = 'authentication/VALIDATE';
const VALIDATE_SUCCESS = 'authentication/VALIDATE_SUCCESS';
const VALIDATE_FAILURE = 'authentication/VALIDATE_FAILURE';

const LOGOUT = 'authentication/LOGOUT';
const LOGOUT_SUCCESS = 'authentication/LOGOUT_SUCCESS';
const LOGOUT_FAILURE = 'authentication/LOGOUT_FAILURE';



export const action = {
	login: creator.action.callable(LOGIN),
	forgot_password: creator.action.callable(FORGOT_PASSWORD),
	reset_password: creator.action.callable(RESET_PASSWORD),
	validate_auth: creator.action.callable(VALIDATE),
	logout: creator.action.callable(LOGOUT),
};

const actionError = (state, action) => {
	const { response, ...payload } = action.payload;
	return response || { success: false, message: 'Unspecified Error', toString: () => 'Unspecified Error', action };
}
const nullify = () => null;

export const reducer = combineReducers({
	authError: creator.reducer.fromObject({
		[VALIDATE_FAILURE]: actionError,
		[VALIDATE_SUCCESS]: nullify,
		[RESET_PASSWORD_FAILURE]: actionError,
		[FORGOT_PASSWORD_FAILURE]: actionError,
		[FORGOT_PASSWORD_SUCCESS]: nullify,
	}, null),
	loginError: creator.reducer.fromObject({
		[LOGIN_FAILURE]: actionError,
		[LOGIN_SUCCESS]: nullify,
	}, null),
	message: creator.reducer.fromObject({
		[FORGOT_PASSWORD_SUCCESS]: (state, action) => action.payload.message,
		[RESET_PASSWORD_SUCCESS]: (state, action) => action.payload.message,
		[RESET_PASSWORD_FAILURE]: (state, action) => action.payload.message
	}, null),
	messageType: creator.reducer.fromObject({
		[FORGOT_PASSWORD_SUCCESS]: (state, action) => action.payload.messageType,
		[RESET_PASSWORD_SUCCESS]: (state, action) => action.payload.messageType,
		[RESET_PASSWORD_FAILURE]: (state, action) => action.payload.messageType
	}, null),
	userInfo: creator.reducer.fromObject({
		[LOGIN_SUCCESS]: (state, action) => {
			const { jwt: token, ...userInfo } = action.payload;
			return userInfo;
		},
	}, userInfo),
	jwt: creator.reducer.fromObject({
		[LOGIN_SUCCESS]: (state, action) => {
			const { jwt: token, ...userInfo } = action.payload;
			return { token: (token || null) };
		},
	}, jwt),
});

export const middleware = creator.middleware.fromObject({
	[LOGIN]: (dispatch, action) => {
		const { email, password } = action;

		dispatch(apiAction.submitJson({ url: `${API_URL}/login`, data: { email, password }, onSuccess: LOGIN_SUCCESS, onError: LOGIN_FAILURE }));
	},
	[LOGIN_SUCCESS]: (dispatch, action) => {
		const { jwt: token, state, ...userInfo } = action.payload;

		if (token && userInfo) {

			dispatch(storeAction.client.replaceState({ payload: state.client || [] }));
			dispatch(storeAction.brand.replaceState({ payload: state.brand || [] }));
			dispatch(storeAction.project.replaceState({ payload: state.project || [] }));
			dispatch(storeAction.projectStatus.replaceState({ payload: state.projectStatus || [] }));

			dispatch(storeAction.finance.get());
			dispatch(storeAction.briefType.get());

			methods.updateStorage('jwt', { token });
			methods.updateStorage('userInfo', userInfo);
		} else {
			dispatch({ type: LOGIN_FAILURE, message: 'No token or user information...' });
		}
	},
	[LOGIN_FAILURE]: (dispatch, action) => {
		console.log('LOGIN_FAILURE', action);
	},

	[FORGOT_PASSWORD]: (dispatch, action) => {
		const { email } = action;

		dispatch(apiAction.legacyPost({ url: `${API_URL}/forgot_password`, data: { email }, onSuccess: FORGOT_PASSWORD_SUCCESS, onError: FORGOT_PASSWORD_FAILURE }));
	},

	[RESET_PASSWORD]: (dispatch, action) => {
		const { userId, hash, password } = action;

		dispatch(apiAction.legacyPost({ url: `${API_URL}/reset_password`, data: { userId, hash, password }, onSuccess: RESET_PASSWORD_SUCCESS, onError: RESET_PASSWORD_FAILURE }));
	},
	[RESET_PASSWORD_SUCCESS]: (dispatch, action) => {
		window.history.pushState({}, '', '/');
	},

	[VALIDATE]: (dispatch, action) => {
		dispatch(apiAction.get({ url: `${API_URL}/validate_auth`, onSuccess: VALIDATE_SUCCESS, onError: VALIDATE_FAILURE }));
	},
	[VALIDATE_SUCCESS]: (dispatch, action, getState) => {
		const { authentication, ...rest } = getState();
		const { userInfo } = authentication;

		// console.log(userInfo);

		dispatch(storeAction.client.get());
		dispatch(storeAction.brand.get());
		dispatch(storeAction.project.get());
		dispatch(storeAction.projectStatus.get());
		dispatch(storeAction.finance.get());
		dispatch(storeAction.briefType.get());
	},
	[VALIDATE_FAILURE]: (dispatch, action) => {
		dispatch({ type: LOGOUT });
	},
	[LOGOUT]: (dispatch, action) => {
		methods.deleteStorage('jwt');
		methods.deleteStorage('userInfo');

		// dispatch({ type: LOGOUT_SUCCESS });

		window.location.href = '/';
	},
});
