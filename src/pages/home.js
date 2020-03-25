import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { action } from 'store';

const Home = () => {

	const dispatch = useDispatch();
	const show = useSelector(state => state.show);
	const showAction = action.show;

	useEffect(() => {
		dispatch(showAction.get());
	}, []);

	return (
		<React.Fragment>
			<h1>Shows</h1>
			<ul className="shows">
			{show.list && show.list.map(show => {
				return <li key={show.id} className="show">
					<Link to={`show/${show.id}`}>{show.name}</Link>
				</li>
			})}
			</ul>
		</React.Fragment>
	);
}

export default Home;