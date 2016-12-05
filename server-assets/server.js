var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');

var config = require('./config');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false
  },
  displayName: String,
  picture: String,
  spotify: String,
  artists: [],
  spotifyToken: String,
});

userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function (err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

app.set('port', process.env.NODE_PORT || 3000);
app.set('host', process.env.NODE_IP || 'localhost');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function (req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, '../../client')));

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({
      message: 'Please make sure your request has an Authorization header'
    });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({
      message: err.message
    });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({
      message: 'Token has expired'
    });
  }
  req.user = payload.sub;
  next();
}


/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    if (!user) {
      return res.status(400).send({
        message: 'User not found'
      });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function (err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Spotify
 |--------------------------------------------------------------------------
 */
app.post('/auth/spotify', function(req, res) {
   var tokenUrl = 'https://accounts.spotify.com/api/token';
   var userUrl = 'https://api.spotify.com/v1/me';
   var artistUrl = 'https://api.spotify.com/v1/me/top/artists'

   var params = {
     grant_type: 'authorization_code',
     code: req.body.code,
     redirect_uri: req.body.redirectUri
   };

   var headers = {
     Authorization: 'Basic ' + new Buffer(req.body.clientId + ':' + config.SPOTIFY_SECRET).toString('base64')
   };

   request.post(tokenUrl, { json: true, form: params, headers: headers }, function(err, response, body) {
     if (body.error) {
       return res.status(400).send({ message: body.error_description });
     }

     request.get(userUrl, {json: true, headers: {Authorization: 'Bearer ' + body.access_token} }, function(err, response, profile){
       // Step 3a. Link user accounts.
       if (req.header('Authorization')) {
         User.findOne({ spotify: profile.id }, function(err, existingUser) {
           if (existingUser) {
              saveArtist(existingUser,body.access_token,artistUrl);
              newReleases(existingUser,body.access_token)
             return res.status(409).send({ message: 'There is already a Spotify account that belongs to you' });
           }
           console.log("189");
           var token = req.header('Authorization').split(' ')[1];
           var payload = jwt.decode(token, config.TOKEN_SECRET);
           User.findById(payload.sub, function(err, user) {
             if (!user) {
               return res.status(400).send({ message: 'User not found' });
             }
             user.spotify = profile.id;
             user.email = user.email || profile.email;
             user.spotifyToken = body.access_token;
             user.picture = profile.images.length > 0 ? profile.images[0].url : '';
             user.displayName = user.displayName || profile.displayName || profile.id;

             user.save(function() {
               var token = createJWT(user);
               res.send({ token: body.access_token });
               console.log("Went through...");
               saveArtist(user,body.access_token,artistUrl);
               newReleases(existingUser,body.access_token)
             });

           });
         });
       } else {
         // Step 3b. Create a new user account or return an existing one.
         User.findOne({ spotify: profile.id }, function(err, existingUser) {
           if (existingUser) {
             saveArtist(existingUser,body.access_token,artistUrl);
             return res.send({ token: body.access_token });
           }
           var user = new User();
           user.spotify = profile.id;
           user.email = profile.email;
           user.spotifyToken = body.access_token;
           user.picture = profile.images.length > 0 ? profile.images[0].url : '';
           user.displayName = profile.displayName || profile.id;
          
           user.save(function(err) {
             res.send({ token: body.access_token });
             saveArtist(user,body.access_token,artistUrl);
           });
         });
       }
     });
   });
 });

/*
 |--------------------------------------------------------------------------
 | Save artists the user follows, update on login 
 |--------------------------------------------------------------------------
 */
 function saveArtist(user,token,artistUrl) {
   console.log("Save Artists start");
   request.get(artistUrl, {json: true, headers: {Authorization: 'Bearer ' + token} }, function(err, response, artist){
                  user.artists.push(artist.items);
                  console.log(artist.items)
                  user.save();
                  return;
            });
 }
 
/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.post('/auth/unlink', ensureAuthenticated, function (req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
    'linkedin', 'live', 'twitter', 'twitch', 'yahoo', 'bitbucket', 'spotify'
  ];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({
      message: 'Unknown OAuth Provider'
    });
  }

  User.findById(req.user, function (err, user) {
    if (!user) {
      return res.status(400).send({
        message: 'User Not Found'
      });
    }
    user[provider] = undefined;
    user.save(function () {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), app.get('host'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});