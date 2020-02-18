import React from 'react';
import Header from './header';
import Footer from './footer';

import 'sass/styles.scss';

const Page = (props) => {

	return (
		<article>
			<Header />
			<div className="content">
				{props.children}
			</div>
			<Footer />
		</article>
	);
}

export default Page;