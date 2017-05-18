//Initilize Packages
var bodyParser  = require('body-parser'),
    moment      = require('moment'),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User        = require('./models/user'),
    express     = require('express'),
    app         = express();

//Connect to MongoDB
mongoose.connect("mongodb://localhost/balticbro");

app.use(require('express-session')({
    secret: 'A74AT Zta98 Rr6UL gRJJq6 UED LxM7jv ecYGf5QBX R5gP8q GNCC 3uUh2XZrkXu 7msj2SubV nrWQjaaa a9',
    resave: false,
    saveUninitialized: false
}));

//Configure Packages
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); //Used with forms, when posting data to a request

app.use(passport.initialize());
app.use(passport.session());

//Responsible for reading the session and unencoding it,
//Encoding it and putting it back in the session
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Mongoose Schema
var msgSchema = new mongoose.Schema({
    name: String,
    time: String,
    message: String
});

var Chat = mongoose.model("chat", msgSchema);

//============================================================================
//Campground - Restful Routes
//============================================================================

//Landing
app.get('/', function(req, res){
    res.render('landing');
});

//=============================================================================
// START: Chat Restful Routes
//=============================================================================

//INDEX ROUTE - Show Chat
app.get('/chat', isLoggedIn, function(req, res){
    
    //Get all the Messages "for a campground"
    //Each Campground will become a channel
    //Need to think about the logic of having a user in a channel or many
    //channels. Should I allow the option to post to more than 1 channel?
    
    Chat.find({}, function(err, allMsgs){
        if(err){
            console.log(err);
        }
        else{
            res.render('chat', {msgs: allMsgs});
        }
    });
    // res.render('campgrounds', {campgrounds: campgrounds});
});

//CREATE ROUTE - Add new Message to DB
app.post('/chat', function(req, res){
    //var name = req.body.name;
    console.log(req.body.username);
    var name = req.body.username;
    var time = moment().format('LT');
    var message = req.body.message;
    var newMsg = {name: req.user.username, time: time, message: message};
    
    //Create a new message and save to DB
    Chat.create(newMsg, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            console.log(newMsg);
            res.redirect('/chat');
        }
    });
});

// //NEW - Show form to Create new Campground
// app.get('/chat/new', function(req, res){
//     res.render('newmsg');
// });

//SHOW ROUTE - Shows info about one campground
app.get("/chat/:id", function(req, res){
    //find the campgroun with provided ID
    //render show template with that campground
    Chat.findById(req.params.id, function(err, foundMsg){
        if(err){
            console.log(err);
        }
        else{
            //render show template with that campground
            res.render("msgshow",  {msg: foundMsg});
        }
    });
});

//=============================================================================
// END: Chat Restful Routes
//=============================================================================


//=============================================================================
//Auth Routes
//=============================================================================
    //Show Signup Form
    app.get('/register', function(req, res){
        res.render('register');
    });
    
    //Handling User Sign up
    app.post('/register', function(req, res){
        req.body.username
        req.body.password
        User.register(new User({username: req.body.username}), req.body.password, function(err, user){
          if(err) {
              console.log(err);
              return res.render('register');
          }
          passport.authenticate('local')(req, res, function(){
            res.redirect('/chat');
          });
        });
    });

//=============================================================================
// //Login Routes
//=============================================================================
    // //Render Login Form
    app.get('/login', function(req, res){
      res.render('login');
    });
    
    //Login Logic
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/chat',
        failureRedirect: '/login'
    }), function(req, res){
    });
    
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
    
    //Middleware
    //=========================================================================
    function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    }

//=============================================================================
//Server Listener
//=============================================================================
    app.listen(process.env.PORT, process.env.IP, function(){
        console.log('Sever has started...');
    });