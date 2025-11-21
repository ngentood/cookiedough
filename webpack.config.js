const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';
	const useManifestV3 = env && env.manifest === 'v3';

	return {
		entry: {
			popup: path.join(__dirname, 'src/popup.tsx'),
		},
		output: {
			path: path.join(__dirname, 'distro'),
			filename: 'js/[name].js',
			clean: true,
		},
		devtool: isProduction ? false : 'source-map',
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					include: path.resolve(__dirname, 'src'),
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					include: path.resolve(__dirname, 'src'),
					use: 'source-map-loader',
					enforce: 'pre',
				},
				{
					test: /\.css$/,
					include: path.resolve(__dirname, 'src'),
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.(sass|scss)$/,
					include: path.resolve(__dirname, 'src'),
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
			],
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js'],
			modules: [path.resolve(__dirname, './src'), 'node_modules'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: path.join(__dirname, 'src/popup.html'),
				filename: 'popup.html',
				inject: 'body',
				minify: false,
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: path.join(__dirname, 'assets'),
						to: '.',
						noErrorOnMissing: true,
					},
					{
						from: path.join(__dirname, `manifest-${useManifestV3 ? 'v3' : 'v2'}.json`),
						to: 'manifest.json',
					},
				],
			}),
		],
		optimization: {
			minimize: isProduction,
		},
	};
};