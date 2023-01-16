const nodeExternals = require('webpack-node-externals');

const path = require('path');

const mode = 'production';

module.exports = {
	entry: './src/main.ts',
	mode,
	target: 'node',
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		filename: '[name].js',
	},
	resolve: {
		extensions: ['.ts'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/i,
				use: ['ts-loader'],
			},
		],
	},
	externals: [nodeExternals()],
};
