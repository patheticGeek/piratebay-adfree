// next.config.js
const withCSS = require('@zeit/next-css');
const withImages = require('next-images');

module.exports = withCSS(withImages());
