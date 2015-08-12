// app/routes.js

// load the todo model
var User = require('./models/user');

// expose the routes to our app with module.exports
module.exports = function(express, app, io) {

    // =================================================================
    // routes ============================================================
    // =================================================================

    // Scoket I/O

    io.use(socketio_jwt.authorize({
      secret: config.secret,
      handshake: true
    }));

    io.on('connection', function (socket) {
      console.log(socket.decoded_token);
      socket.join(socket.decoded_token.email);
    });

    // forward all changes to this io route to send refresh event
    io.on('refresh', function (socket) {
        console.log('broadcasting event refresh client');
        socket.broadcast.to(socket.decoded_token.email).emit('refresh client', {
            message: 'refreshed'
        });
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        req.session.loginDate = new Date().toString();
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', function (req, res) {
        User.findOne({
            'local.email': email
        }, function(err, existingUser) {

            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if there's already a user with that email
            if (existingUser)
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

            //  If we're logged in, we're connecting a new local account.
            if (req.user) {
                var user = req.user;
                user.local.email = email;
                user.local.password = user.generateHash(password);
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
            //  We're not logged in, so we're creating a brand new user.
            else {
                // create the user
                var newUser = new User();

                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);

                newUser.save(function(err) {
                    if (err)
                        throw err;

                    return done(null, newUser);
                });
            }

        });
    });

    // ---------------------------------------------------------
    // get an instance of the router for api routes
    // ---------------------------------------------------------
    var apiRoutes = express.Router();

    // ---------------------------------------------------------
    // signup (no middleware necessary since this isnt authenticated)
    // ---------------------------------------------------------
    // http://localhost:8080/api/signup
    apiRoutes.post('/signup', function(req, res) {

        // find the user
        User.findOne({
            name: req.body.name
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    //  If we're logged in, we're connecting a new local account.
                    if (req.user) {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {
                        // if user is not found
                        // create a user and give them a token
                        var newUser = new User();

                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });

                        var token = jwt.sign(user, app.get('superSecret'), {
                            expiresInMinutes: 30 // expires in 30 minutes
                        });

                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }

            }

        });
    });

    // ---------------------------------------------------------
    // authentication (no middleware necessary since this isnt authenticated)
    // ---------------------------------------------------------
    // http://localhost:8080/api/authenticate
    apiRoutes.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            name: req.body.name
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, app.get('superSecret'), {
                        expiresInMinutes: 30 // expires in 30 minutes
                    });

                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    });

    // ---------------------------------------------------------
    // route middleware to authenticate and check token
    // ---------------------------------------------------------
    apiRoutes.use(function(req, res, next) {

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }

    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    apiRoutes.get('/profile', function(req, res) {
        // console.log(req.user);
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    apiRoutes.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // SETTINGS ============================
    // =====================================
    apiRoutes.get('/settings', function(req, res) {
        res.render('settings.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // locally --------------------------------
    apiRoutes.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });

    apiRoutes.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =============================================================================
    // UNLINK ACCOUNTS ============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    apiRoutes.get('/unlink/local', function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // DAILY

    // get all todos
    apiRoutes.get('/daily', function(req, res) {
        var user = req.user;
        res.json(user.daily); // return all todos in JSON format
    });

    // create todo and send back all todos after creation
    apiRoutes.post('/daily', function(req, res) {
        var user = req.user;
        // create a todo, information comes from AJAX request from Angular
        user.daily.push({
            text: req.body.text,
            date: Date.now(),
            done: false
        });

        user.save(function(err) {
            if (err) return handleError(err)
        });

        res.json(user.daily);
    });

    // delete a todo
    apiRoutes.delete('/daily/:todo_id', function(req, res) {
        var user = req.user;

        user.daily.id(req.params.todo_id).remove();
        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.daily);
    });

    // toggle done
    apiRoutes.post('/daily/:todo_id', function(req, res) {
        var user = req.user;
        var todo = user.daily.id(req.params.todo_id);

        if (todo.done === true) {
            todo.done = false;
        } else {
            todo.done = true;
        }

        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.daily);
    });

    // WEEKLY

    // get all todos
    apiRoutes.get('/weekly', function(req, res) {
        var user = req.user;
        res.json(user.weekly); // return all todos in JSON format
    });

    // create todo and send back all todos after creation
    apiRoutes.post('/weekly', function(req, res) {
        var user = req.user;
        // create a todo, information comes from AJAX request from Angular
        user.weekly.push({
            text: req.body.text,
            date: Date.now(),
            done: false
        });

        user.save(function(err) {
            if (err) return handleError(err)
        });

        res.json(user.weekly);

    });

    // delete a todo
    apiRoutes.delete('/weekly/:todo_id', function(req, res) {
        var user = req.user;

        user.weekly.id(req.params.todo_id).remove();
        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.weekly);
    });

    // toggle done
    apiRoutes.post('/weekly/:todo_id', function(req, res) {
        var user = req.user;
        var todo = user.weekly.id(req.params.todo_id);

        if (todo.done === true) {
            todo.done = false;
        } else {
            todo.done = true;
        }

        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.weekly);
    });

    // MONTHLY

    // get all todos
    apiRoutes.get('/monthly', function(req, res) {
        var user = req.user;
        res.json(user.monthly); // return all todos in JSON format
    });

    // create todo and send back all todos after creation
    apiRoutes.post('/monthly', function(req, res) {
        var user = req.user;
        // create a todo, information comes from AJAX request from Angular
        user.monthly.push({
            text: req.body.text,
            date: Date.now(),
            done: false
        });

        user.save(function(err) {
            if (err) return handleError(err)
        });

        res.json(user.monthly);

    });

    // delete a todo
    apiRoutes.delete('/monthly/:todo_id', function(req, res) {
        var user = req.user;

        user.monthly.id(req.params.todo_id).remove();
        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.monthly);
    });

    // toggle done
    apiRoutes.post('/monthly/:todo_id', function(req, res) {
        var user = req.user;
        var todo = user.monthly.id(req.params.todo_id);

        if (todo.done === true) {
            todo.done = false;
        } else {
            todo.done = true;
        }

        user.save(function(err) {
            if (err) return handleError(err);
        });

        res.json(user.monthly);
    });

    app.use('/api', apiRoutes);

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('index.ejs');
    });

};