import { combineReducers } from 'redux';
import creator from 'common/creator';


const SHOW_MODAL = 'view/SHOW_MODAL';
const CLOSE_MODAL = 'view/CLOSE_MODAL';
const REMOVE_MODAL = 'view/REMOVE_MODAL';

export const action = {
	showModal: creator.action.callable(SHOW_MODAL),
	closeModal: creator.action.callable(CLOSE_MODAL),
	removeModal: creator.action.callable(REMOVE_MODAL)
};

const nullify = () => null;

export const reducer = combineReducers({
	modal: creator.reducer.fromObject({
		[SHOW_MODAL]: (state, action) => {
			return action.payload;
		},
		[CLOSE_MODAL]: (state, action) => {
			return {...state, modalClosing: true};
		},
		[REMOVE_MODAL]: (state, action) => {
			return nullify();
		}
	}, null)
});

export const middleware = creator.middleware.fromObject({
	// [VIEW_BRIEF]: (dispatch, action) => {
	// 	dispatch(apiAction.get({ url: `${API_URL}/view?brief_id=${action.brief_id}`, onSuccess: VIEW_BRIEF_SUCCESS, onError: VIEW_BRIEF_FAILURE }));
	// }
});
