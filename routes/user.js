const { response } = require('express');
var express = require('express');
const contactForm = require('../helpers/contactForm');
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
var router = express.Router();
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.render('user/login')
  }
}
/* GET home page. */
router.get('/', function async(req, res, next) {

  productHelpers.getAllProducts().then((products) => {

    res.render('user/userPage', { layout: 'layout2', products})
  })
});
router.post('/submit', (req, res) => {
  contactForm.getdata(req.body).then((response) => {
    res.redirect('/');
  })
})
router.get('/signup', function (req, res) {
  res.render('user/signup', { admin: false })
})
router.get('/login', function (req, res) {
  res.render('user/login', { admin: false })

})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response)
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/login')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then(async(response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      let user = req.session.user
     await userHelpers.getCartCount(req.session.user._id).then((count)=>{
        productHelpers.getAllProducts().then((products) => {
          res.render('user/userPage', {products, user,count})
        })
      })
      

    }
    else {
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res, next) => {
  let products = await userHelpers.getCartItems(req.session.user._id)
  console.log(products)
  res.render('user/cart', { user: req.session.user, products })

})
router.get('/user/userPage/addTocart/:id', verifyLogin, (req, res) => {
  userHelpers.addTocart(req.params.id, req.session.user._id).then(() => {
    res.render('user/userpage',);
  })
})
module.exports = router;