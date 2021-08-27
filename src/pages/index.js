import Home from 'pages/home';
import About from 'pages/about';
import Show from 'pages/show';

export default [
	{
		component: Home,
		title: 'Home',
		displayInNav: true,
		paths: [
			'/'
		]
	},
	{
		component: About,
		title: 'About',
		displayInNav: true,
		paths: [
			'/about'
		]
	},
	{
		component: Show,
		title: 'Show',
		displayInNav: false,
		paths: [
			'/show',
			'/show/:id',
		]
	}
];