import React from 'react';
import { Link }  from 'react-router-dom';
import pages from 'pages';

export default () => (
	<nav>
		<ul>
			{
				pages.map(page => page.displayInNav ? <Link to={page.paths[0]}>{page.title}</Link> : null)
			}
		</ul>
	</nav>
);