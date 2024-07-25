const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports =  {
    target: "node",
    entry: "./index.ts",
    mode: "production",
    plugins: [new Dotenv()],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            "amdfriend/src": "amdfriend/dist",
            "@src": path.resolve(__dirname, "src"),
            "@patches": path.resolve(__dirname, "src", "patches"),
        }
    },
};
