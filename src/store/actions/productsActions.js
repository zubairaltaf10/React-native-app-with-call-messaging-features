// // import Product from '../../models/Product';

// export const DELETE_PRODUCT = 'DELETE_PRODUCT';
// export const CREATE_PRODUCT = 'CREATE_PRODUCT';
// export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
// export const SET_PRODUCTS = 'SET_PRODUCTS';

// export const fetchProducts = () => {
//   return async (dispatch, getState) => {
//     // any async code you want!
//     alert('FetchProf')
//     const userId = getState().auth.userId;
//     try {
//       const response = await fetch(
//         'https://authentication-1c4c2.firebaseio.com/products.json',
//       );

//       if (!response.ok) {
//         throw new Error('Something went wrong!');
//       }

//       const resData = await response.json();
//       const loadedProducts = [];

//       for (const key in resData) {
//         loadedProducts.push(
//           new Product(
//             key,
//             resData[key].ownerId,
//             resData[key].title,
//             resData[key].imageUrl,
//             resData[key].description,
//             resData[key].price,
//           ),
//         );
//       }
// console.log(loadedProducts)
//       dispatch({
//         type: SET_PRODUCTS,
//         payload: {
//           availableProducts: loadedProducts,
//           userProducts: loadedProducts.filter(
//             (prod) => prod.ownerId === userId,
//           ),
//         },
//       });
//     } catch (err) {
//       // send to custom analytics server
//       throw err;
//     }
//   };
// };

// export const deleteProduct = (productId) => {
//   return async (dispatch, getState) => {
//     const token = getState().auth.token;
//     const response = await fetch(
//       `https://authentication-1c4c2.firebaseio.com/products/${productId}.json?auth=${token}`,
//       {
//         method: 'DELETE',
//       },
//     );
//     dispatch({type: DELETE_PRODUCT, payload: productId});
//   };
// };

// export const createProduct = (title, imageUrl, description, price) => {
//   return async (dispatch, getState) => {
//     // any async code you want!
//     const token = getState().auth.token;
//     const userId = getState().auth.userId;
//     const response = await fetch(
//       `https://authentication-1c4c2.firebaseio.com/products.json?auth=${token}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title,
//           description,
//           imageUrl,
//           price,
//           ownerId: userId,
//         }),
//       },
//     );

//     const resData = await response.json();

//     dispatch({
//       type: CREATE_PRODUCT,
//       payload: {
//         id: resData.name,
//         title,
//         description,
//         imageUrl,
//         price,
//         ownerId: userId,
//       },
//     });
//   };
// };

// export const updateProduct = (id, title, imageUrl, description) => {
//   return async (dispatch, getState) => {
//     const token = getState().auth.token;
//     const response = await fetch(
//       `https://authentication-1c4c2.firebaseio.com/products/${id}.json?auth=${token}`,
//       {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title,
//           description,
//           imageUrl,
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error('Something went wrong!');
//     }

//     dispatch({
//       type: UPDATE_PRODUCT,
//       payload: {id, title, imageUrl, description},
//     });
//   };
// };
