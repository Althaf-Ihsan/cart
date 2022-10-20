var db = require("../config/connection")
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require("../app")
const { ObjectId, ObjectID } = require('mongodb');
const { cart_collection } = require("../config/collections");
const collections = require("../config/collections");
const { helpers } = require("handlebars");
const productHelpers = require("./product-helpers");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10)
      db.get().collection(collection.user_collection).insertOne(userData).then((data) => {
        resolve(data.insertedId)
      });
    })
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {}
      let user = await db.get().collection(collection.user_collection).findOne({ email: userData.email })
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user
            response.status = true
            resolve(response)
            console.log("login success")
          }
          else {
            console.log("login failed")
            resolve({ status: false })
          }
        })
      }
      else {
        console.log("login failedddd")
        resolve({ status: false })
      }
    })
  }
  ,
  addTocart: (proId,userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.cart_collection).findOne({ user: ObjectId(userId) })
      if (userCart) {
        await db.get().collection(collection.cart_collection).updateOne({ user: ObjectId(userId) }, {
          $push: { products: ObjectId(proId) }
        }).then((response) => {
          resolve()
        })

      }
      else {
        let cartObj = {
          user: ObjectId(userId),
          products: [ObjectId(proId)]
        }

        db.get().collection(collection.cart_collection).insertOne(cartObj).then((response) => {
          resolve()
        })
      }
    })
  }
  ,
  getCartItems: (userId) => {
      return new Promise(async (resolve, reject) => {
        let cartItems = await db.get().collection(collection.cart_collection).aggregate([
          {
            $match: { user: ObjectId(userId) }
          },
          {
           $lookup:{
            from:collection.PRODUCT_COLLECTIONS,
            let:{prodList:'$products'},
            pipeline:[
              {
                $match:{
                 $expr:{
                  $in:['$_id',"$$prodList"]
                 }
                }
              }
            ],
            as:'cartItems'
           }
          }
        ]).toArray()
        resolve(cartItems[0].cartItems)
      })

    } ,
    getCartCount:(userId)=>{
      return new Promise(async (resolve, reject) => {
        let count=0;
        let cart = await db.get().collection(collection.cart_collection).findOne({user:ObjectId(userId)})
          if(cart)
          {
          count=cart.products.length
          }
          resolve(count)
        })
       
  }

}
