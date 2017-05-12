//Initilize Packages
var bodyParser  = require('body-parser'),
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
var dataSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    opendate: String,
    closedate: String,
    zipcode: String
});

var Microbrew = mongoose.model("Microbrew", dataSchema);

// Create Campground and push to database
// Microbrew.create({
//     name: "Kursi Alus",
//     image: "https://d13yacurqjgara.cloudfront.net/users/42885/screenshots/1803275/lacplesis_gifts_2014-02.png",
//     description: "This is a delicious beer."
    
//     }, function(err, brew){
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log("New brew create")    
//             console.log(brew);
//         }
//     });



//============================================================================
//Restful Routes
//============================================================================

//Landing
app.get('/', function(req, res){
    res.render('landing');
});

//INDEX ROUTE - Show all campgrounds
app.get('/brews', isLoggedIn, function(req, res){
    //Get all camgrounds from DB
    Microbrew.find({}, function(err, allBrews){
        if(err){
            console.log(err);
        }
        else{
            res.render('index', {brews: allBrews});
        }
    });
    // res.render('campgrounds', {campgrounds: campgrounds});
});

//CREATE ROUTE - Add new campground to DB
app.post('/brews', function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newBrew = {name: name, image: image, description: desc};

    //campgrounds.push(newCampground); OLD LINE for Hardcoded campgrounds
    
    //Create a new Campground and save to DB
    Microbrew.create(newBrew, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/brews');
        }
    });
    
    //get data from form and add to camp grounds array
    // redirect abck to the camp grounds page
});

//NEW - Show form to Create new Campground
app.get('/brews/new', function(req, res){
    res.render('new');
});

//SHOW ROUTE - Shows info about one campground
app.get("/brews/:id", function(req, res){
    //find the campgroun with provided ID
    //render show template with that campground
    Microbrew.findById(req.params.id, function(err, foundBrew){
        if(err){
            console.log(err);
        }
        else{
            //render show template with that campground
            res.render("show",  {brew: foundBrew});
        }
    });
});


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
            res.redirect('/brews');
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
        successRedirect: '/brews',
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