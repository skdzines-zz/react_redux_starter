import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { action } from 'store';

const Show = () => {

	const params = useParams();
	const showAction = action.show;
	const dispatch = useDispatch();

	const list = useSelector(state => state.show.list);
	const [selectedShow, setSelectedShow] = useState([]);

	useEffect(() => {
		if(!list.length) {
			dispatch(showAction.get({id: params.id}));
		} else {
			setSelectedShow(list.filter(show => show.id === Number(params.id)));
		}
	}, [list]);

	return (
		selectedShow.length ?
			<React.Fragment>
				<h1>{selectedShow[0].name}</h1>
				<img src={selectedShow[0].image.medium} />
				<p dangerouslySetInnerHTML={{__html: selectedShow[0].summary}}></p>
			</React.Fragment>
		: null
	);
}

export default Show;