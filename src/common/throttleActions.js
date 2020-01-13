const throttled = {};

export default ({ getState, dispatch }) => next => action => {
	const time = action.meta && action.meta.throttle;
	const key = JSON.stringify(action);

	if (!time) {
		return next(action);
	}

	if (throttled[key]) {
		// console.log(`${key} Throttled...`);
		return;
	} else {
		// console.log(`${key} Passed...`);
	}

	throttled[key] = true;

	setTimeout(() => {
		throttled[key] = false;
	}, time);

	next(action);
}
