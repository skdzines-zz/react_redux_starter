export default {
	middleware: {
		fromObject(actionMap) {
			return [...Object.keys(actionMap).map(
				(actionType) => {
					return ({dispatch, getState}) => next => action => {
						if (actionType === action.type) {
							if (typeof actionMap[action.type] !== 'undefined') {
								next(action);
								return actionMap[action.type](dispatch, action, getState);
							}
						}
						return next(action);
					};
				}
			)];
		}
	},
	reducer: {
		// fromObject(actionMap, defaultValue) {
		// 	return (state = defaultValue, action) => {
		// 		let newState = state;
		// 		Object.entries(actionMap).forEach(([actionSet, handler]) => {
		// 			actionSet.split('|').forEach(responseAction => {
		// 				if (responseAction === action.type && typeof handler !== 'undefined') {
		// 					newState = handler(newState, action);
		// 				}
		// 			});
		// 		});
		// 		return newState;
		// 	}
		// },
		// actions(...args) {
		// 	return args.join('|');
		// }
		fromObject(actionMap, defaultValue) {
			return (state = defaultValue, action) => {
				if (typeof actionMap[action.type] !== 'undefined') {
					return actionMap[action.type](state, action);
				}
				return state;
			}
		}
	},
	action: {
		eventHandler(type, proto) {
			return event => ({ ...proto, type, event });
		},
		callable(type, proto) {
			return (options, meta) => ({ ...proto, ...options, meta, type });
		},
	}
};
