const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    resolve: {
        fallback: {
            "url": require.resolve("url/")
        }
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    mode: "production",
    devtool: "inline-source-map",
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public'),
        clean: true
    },
    module: {

        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.scss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.png/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024, // 10kb
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devServer: {
        watchFiles: ['src/**/*'],
        static: true,
        hot: true,
        compress: true,
        port: 9000,
        https: true
    },
};