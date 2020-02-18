import { combineReducers } from 'redux';
import creator from 'common/creator';
import methods from 'common/methods';

import { action as apiAction } from 'store/api';

const MAX_MESSAGE_QUEUE = 5;

class ExtendedArray extends Array {
	part(filterObject = {}) {
		const filterEntries = Object.entries(filterObject);
		return this.filter(
			item => {
				let matchingEntries = filterEntries.filter(([key, value]) => item[key] === value);
				return matchingEntries.length === filterEntries.length;
			}
		);
	}
}

export default {
	create: function(url, stateKey) {
		const CREATE = url + ':CREATE';
		const CREATE_SUCCESS = url + ':CREATE_SUCCESS';
		const CREATE_FAILURE = url + ':CREATE_FAILURE';

		const READ = url + ':READ';
		const READ_SUCCESS = url + ':READ_SUCCESS';
		const READ_FAILURE = url + ':READ_FAILURE';
		const READ_ALL_SUCCESS = url + ':READ_ALL_SUCCESS';
		const READ_ALL_FAILURE = url + ':READ_ALL_FAILURE';

		const UPDATE = url + ':UPDATE';
		const UPDATE_SUCCESS = url + ':UPDATE_SUCCESS';
		const UPDATE_FAILURE = url + ':UPDATE_FAILURE';

		const DELETE = url + ':DELETE';
		const DELETE_SUCCESS = url + ':DELETE_SUCCESS';
		const DELETE_FAILURE = url + ':DELETE_FAILURE';

		const UPLOAD = url + ':UPLOAD';
		const UPLOAD_SUCCESS = url + ':UPLOAD_SUCCESS';
		const UPLOAD_FAILURE = url + ':UPLOAD_FAILURE';
		const UPLOAD_PROGRESS = url + ':UPLOAD_PROGRESS';

		const REPLACE_STATE = url + ':REPLACE_STATE';

		const actionMessage = (state, action) => {
			const { response, ...payload } = action.payload;
			if (response && response.success) {
				return response;
			} else if (response && !response.success) {
				return { ...response, payload };
			}
			return { success: false, message: 'Unspecified Error', toString: () => 'Unspecified Error', action };
		}
		const actionPayload = (state, action) => action.payload || null;
		const nullify = () => null;
		const actionMessageQueue = (state, action) => {
			const { response, ...payload } = action.payload;
			if (action.payload instanceof Error) {
				throw action.payload;
			}
			var test = [...state, ...(response.message && [{ ...response, payload }] || [])].slice(-MAX_MESSAGE_QUEUE);
			return test;
		}
		const actionTimeStamp = (state, action) => {
			return Date.now();
		}

		return {
			action: {
				add: creator.action.callable(CREATE),
				get: creator.action.callable(READ),
				edit: creator.action.callable(UPDATE),
				remove: creator.action.callable(DELETE),
				replaceState: creator.action.callable(REPLACE_STATE),
				upload: creator.action.callable(UPLOAD),
			},

			reducer: combineReducers({
				message: creator.reducer.fromObject({
					[CREATE_SUCCESS]: actionMessage,
					[READ_SUCCESS]: actionMessage,
					[READ_ALL_SUCCESS]: actionMessage,
					[UPDATE_SUCCESS]: actionMessage,
					[DELETE_SUCCESS]: actionMessage,
					[UPLOAD_SUCCESS]: actionMessage,
					[CREATE_FAILURE]: actionMessage,
					[READ_FAILURE]: actionMessage,
					[READ_ALL_FAILURE]: actionMessage,
					[UPDATE_FAILURE]: actionMessage,
					[DELETE_FAILURE]: actionMessage,
					[UPLOAD_FAILURE]: actionMessage,
				}, null),
				list: creator.reducer.fromObject({
					[CREATE_SUCCESS]: (state, action) => {
						const { response, ...payload } = action.payload;
						if (action.payload.length) {
							const removeIds = [ ...(action.payload) ].map(p => parseInt(p.id));
							return new ExtendedArray(
								...(state.filter(record => !removeIds.includes(parseInt(record.id)))),
								...(action.payload)
							);
						}
						return new ExtendedArray( ...state, payload );
					},
					[READ_SUCCESS]: (state, action) => {
						return [...state, action.payload];
						// const { response, ...rest } = action.payload;
						// const data = Object.entries(rest).map(([index, value]) => !isNaN(index) && value );
						// const removeIds = data.map(p => parseInt(p.id));
						// return new ExtendedArray(
						// 	...(state.filter(record => !removeIds.includes(parseInt(record.id)))),
						// 	...data
						// );
					},
					[READ_ALL_SUCCESS]: (state, action) => {
						return new ExtendedArray( ...(action.payload.length ? action.payload : new ExtendedArray()) );
					},
					[UPDATE_SUCCESS]: (state, action) => {
						const { response, ...payload } = action.payload;
						if(payload.id) {
							return new ExtendedArray(
								...(state.filter(record => record.id !== payload.id)),
								...([{
									...(state.find(record => record.id === payload.id)),
									...payload
								}])
							);
						}
						return state;
					},
					[DELETE_SUCCESS]: (state, action) => {
						const { response, ...payload } = action.payload;
						return new ExtendedArray(
							...(state.filter(record => record.id !== payload.id))
						);
					},
					[REPLACE_STATE]: (state, action) => {
						return new ExtendedArray( ...(action.payload.length ? action.payload : new ExtendedArray()) );
					},
					[UPLOAD_SUCCESS]: (state, action) => {
						const { response, ...payload } = action.payload;
						return new ExtendedArray(
                            ...(state.filter(record => record.shortId !== payload.shortId)),
                            ...([{
                                ...(state.find(record => record.shortId === payload.shortId)),
                                ...payload
                            }])
                        );
					},
					[UPLOAD_PROGRESS]: (state, action) => {
						const { payload } = action;
						return new ExtendedArray(
							...(state.filter(record => record.shortId !== payload.shortId)),
							...([{
								...(state.find(record => record.shortId === payload.shortId)),
								...payload
							}])
						);
					},
				}, new ExtendedArray()),
				messageQueue: creator.reducer.fromObject({
					[CREATE_SUCCESS]: actionMessageQueue,
					[UPDATE_SUCCESS]: actionMessageQueue,
					[DELETE_SUCCESS]: actionMessageQueue,

					[CREATE_FAILURE]: actionMessageQueue,
					[READ_FAILURE]: actionMessageQueue,
					[READ_ALL_FAILURE]: actionMessageQueue,
					[UPDATE_FAILURE]: actionMessageQueue,
					[DELETE_FAILURE]: actionMessageQueue,
					[UPLOAD_FAILURE]: actionMessageQueue,
				}, []),
				messageTimeStamp: creator.reducer.fromObject({
					[CREATE_SUCCESS]: actionTimeStamp,
					[UPDATE_SUCCESS]: actionTimeStamp,
					[DELETE_SUCCESS]: actionTimeStamp,

					[CREATE_FAILURE]: actionTimeStamp,
					[READ_FAILURE]: actionTimeStamp,
					[READ_ALL_FAILURE]: actionTimeStamp,
					[UPDATE_FAILURE]: actionTimeStamp,
					[DELETE_FAILURE]: actionTimeStamp,
					[UPLOAD_FAILURE]: actionTimeStamp,
				}, [])
			}),

			middleware: creator.middleware.fromObject({
				[CREATE]: (dispatch, action) => {
					const { type, ...rest } = action;
					const { meta, ...data } = rest;

					return dispatch(apiAction.add({ url: `${url}`, meta, data, onSuccess: CREATE_SUCCESS, onError: CREATE_FAILURE }));
				},
				[READ]: (dispatch, action) => {
					const { type, ...rest } = action;
					const { meta, ...data } = rest;

					if (data.id) {
						const { id, ...rest } = data;
						return dispatch(apiAction.get({ url: `${url}/${id}`, meta, rest, onSuccess: READ_SUCCESS, onError: READ_FAILURE }));
					} else if (!!(Object.keys(data).length)) {
						return dispatch(apiAction.get({ url: `${url}`, meta, data, onSuccess: READ_SUCCESS, onError: READ_FAILURE }));
					} else {
						return dispatch(apiAction.get({ url: `${url}`, meta, data, onSuccess: READ_ALL_SUCCESS, onError: READ_ALL_FAILURE }));
					}
				},
				[UPDATE]: (dispatch, action, getState) => {
					const { type, id, ...rest } = action;
					const { meta, ...data } = rest;
					const { list } = getState()[stateKey];
					const currentRecord = list.find(record => record.id === id);

					if (currentRecord) {
						return dispatch(apiAction.edit({ url: `${url}/${id}`, meta, data, onSuccess: UPDATE_SUCCESS, onError: UPDATE_FAILURE }));
					} else {
						return dispatch({ type: UPDATE_FAILURE, error: `Unable to find id# ${id} for ${url}/${id} in the local store.` });
					}
				},
				[DELETE]: (dispatch, action) => {
					const { type, id, ...rest } = action;
					const { meta, ...data } = rest;

					return dispatch(apiAction.remove({ url: `${url}/${id}`, meta, onSuccess: DELETE_SUCCESS, onError: DELETE_FAILURE }));
				},
				[UPLOAD]: (dispatch, action) => {
					const { type, ...rest } = action;
					const { meta, ...data } = rest;

					return dispatch(apiAction.upload({ url: `${url}`, meta, data, onProgress: UPLOAD_PROGRESS, onSuccess: UPLOAD_SUCCESS, onError: UPLOAD_FAILURE }));
				},
			}),
		}
	}
}

