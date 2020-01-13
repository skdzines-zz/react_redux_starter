import React, { Component } from 'react';
import Connect from 'components/util/connect';

import { action } from 'store';

import 'sass/styles.scss';

const mapToProps = {
	state: ['api', 'user'],
	actions: { userAction: action.user }
}

export default Connect(
	class Main extends Component {
		componentDidMount() {
			//this.props.actions.application.initialize();
			const { userAction } = this.props.actions;
			userAction.get();
		}

		render() {
			const { user } = this.props;
			console.log(user);
			return (
				<main>
					<h1>Hello World!</h1>
					{user.list && user.list.map(user => {
						return <div>
							<strong>Name:</strong> {user.name} <br />
							<strong>Email:</strong> {user.email}
						</div>
					})}
				</main>
			);
		}
	},
	mapToProps
);
