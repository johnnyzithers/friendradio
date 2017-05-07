var webpack = require("webpack");

module.exports = {

	entry: ["./app.js", "./js/jscolor.js", "./js/roommenu.js", "./js/helperanimation.js", "./js/jquery-3.1.1.min.js", "./js/customcss.js", "./css/style.css"],
	output: {
		filename: "bundle.js"
	},
	
	module: {
	 

        loaders: [
			{ 

				test: /\.css$/, use: [ 
				{
					loader: 'style-loader', 
				},
				{
					loader: 'css-loader' ,
				},
			]},
			{
				test: /\.png$/, 
				loader: 'file-loader'
			}
		]
    },
    node: {
	  fs: "empty"
	},
  
    resolve: {
        alias: {
            jquery: "./js/jquery-3.1.1.min.js"
        }
    },

	// plugins: [
 //        new webpack.ProvidePlugin({
 //            $: "jquery",
 //            jQuery: "jquery",
 //            "window.jQuery": "jquery"
 //        })
 //    ],
  	// target: 'node',

	watch: true
}
