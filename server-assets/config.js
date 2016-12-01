module.exports = {
  // App Settings
  MONGO_URI: process.env.MONGO_URI || 'mongodb://kyle:admin@ds113608.mlab.com:13608/releasenotify',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'YOUR_UNIQUE_JWT_TOKEN_SECRET',

  // OAuth 2.0
  SPOTIFY_SECRET: process.env.SPOTIFY_SECRET || 'e053702cabe94aaa9427dd439eeee066',

};
