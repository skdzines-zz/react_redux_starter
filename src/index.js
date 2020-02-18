import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from 'store';
import Routes from 'routes';

import 'sass/styles.scss';

ReactDOM.render(
	<Provider store={ store }>
		<Routes />
	</Provider>,
	document.body.appendChild(document.createElement('div'))
);
