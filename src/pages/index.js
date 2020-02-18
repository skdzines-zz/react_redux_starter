import Home from 'pages/home';
import About from 'pages/about';
import Show from 'pages/show';

export default [
	{
		component: Home,
		paths: [
			'/'
		]
	},
	{
		component: About,
		paths: [
			'/about'
		]
	},
	{
		component: Show,
		paths: [
			'/show',
			'/show/:id',
		]
	}
];