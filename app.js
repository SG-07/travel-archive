const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
require('dotenv').config(); // Load environment variables
const listingRoutes = require('./routes/listings');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/expressError.js');

//middlewavers
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use('/listings', listingRoutes);
app.engine('ejs', ejsMate);



//connecting to db
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // ✅ Allows MongoDB 30 sec to respond before timing out
    socketTimeoutMS: 45000, // ✅ Ensures longer wait time before closing connection
})
  .then(() => {
      console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  })
  .catch(err => {
      console.error("MongoDB connection error:", err);
      process.exit(1); // ✅ Exits process on critical failure
  });



//disconneting from db
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
    }
});


app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found!'));
});

app.use((err, req, res, next) => {
    let {statusCode= 500, message= 'something went Wrong!'} = err;
    res.status(statusCode).send(message); 
});


app.get("/", (req, res)=> {
    console.log("Server working fine");
    res.redirect('/listings/allListings');
});

function printRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route) {
      // This layer is a route
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
      console.log(`Registered route: ${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // This layer is a router, recursively print its routes
      printRoutes(layer.handle.stack, prefix + (layer.regexp.source === '^\\/' ? '' : layer.regexp.source.replace(/\\\//g, '/').replace(/[\^\$\?\:]/g, '')));
    }
  });
}

// After all routes are registered:
printRoutes(app._router.stack);


// Log all registered routes
app._router.stack
  .filter(r => r.route && r.route.path)
  .forEach(r => {
    console.log(`Registered route: ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  });

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

