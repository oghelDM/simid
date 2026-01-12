const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	devServer: {
		static: {
			directory: path.join(__dirname, "build"),
		},
		compress: true,
		port: 8080,
		hot: true,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods":
				"GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers":
				"X-Requested-With, content-type, Authorization",
		},
		server: {
			type: "https",
			options: {
				key: path.resolve(__dirname, "cert/server.key"),
				cert: path.resolve(__dirname, "cert/server.cert"),
			},
		},
		client: {
			overlay: {
				runtimeErrors: (error: any) => {
					if (
						error.message ===
						"ResizeObserver loop completed with undelivered notifications."
					) {
						return false;
					}
					return true;
				},
			},
		},
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},

	output: {
		filename: "creative.js",
		path: path.resolve(__dirname, "build"),
		clean: true,
	},

	optimization: {
		minimize: false, // Disable for dev to see console logs
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
		],
	},

	plugins: [
		// Wrapper page
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./src/common/index.html",
			chunks: [],
			inject: false,
		}),
		// Creative page - inject ALL chunks (main chunk from CLI entry)
		new HtmlWebpackPlugin({
			filename: "creative.html",
			template: "./src/common/creative.html",
			chunks: "all", // Changed from chunks: [] to chunks: "all"
			inject: "body",
		}),
		new CopyPlugin({
			patterns: [{ from: "public", to: "." }],
		}),
	],

	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		plugins: [new TsconfigPathsPlugin()],
	},
};
