import { combineReducers, createStore, applyMiddleware, compose } from 'redux';

import { API_HOST } from 'config';

import throttleActionsMiddleware from 'common/throttleActions.js';

import { reducer as apiReducer, middleware as apiMiddleware } from './api';
import { reducer as authenticationReducer, middleware as authenticationMiddleware } from './authentication';
import { action as viewAction, reducer as viewReducer, middleware as viewMiddleware } from './view';

import restfulState from './restfulState';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const restfulObjects = {
	user: restfulState.create(`${API_HOST}/users`, 'user'),
};

export const action = {
	view: viewAction,
	...(Object.entries(restfulObjects).reduce((accum, [key, value]) => ({ ...accum, [key]: value.action }), {}))
};

const reducers = combineReducers({
	api: apiReducer,
	authentication: authenticationReducer,
	view: viewReducer,
	...(Object.entries(restfulObjects).reduce((accum, [key, value]) => ({ ...accum, [key]: value.reducer }), {}))
});

export default createStore(reducers, composeEnhancers(
	applyMiddleware(
		throttleActionsMiddleware,
		...apiMiddleware,
		...authenticationMiddleware,
		...viewMiddleware,
		...(Object.entries(restfulObjects).reduce((accum, [key, value]) => ([ ...accum, ...(value.middleware) ]), []))
	)
));

