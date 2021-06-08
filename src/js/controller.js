import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

import 'core-js/stable' // es6
import 'regenerator-runtime' // es6+
import { async } from 'regenerator-runtime'

// if (module.hot) {
//   module.hot.accept()
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)
    if (!id) return

    //0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    //1 Updating bookmarks on page reload
    bookmarksView.update(model.state.bookmarked)

    //2 rendering spinner
    recipeView.renderSpinner()

    //3 loading recipe
    await model.loadRecipe(id)

    //4 rendering recipe
    recipeView.render(model.state.recipe)
  } catch (err) {
    recipeView.renderError()
    console.error(err)
  }
}

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery()
    if (!query) return

    //1 rendering spinner
    resultsView.renderSpinner()

    //2 loading search results
    await model.loadSearchResults(query)

    //3 rendering search results
    resultsView.render(model.getSearchResultsPage())

    //4 render initial pagination page
    paginationView.render(model.state.search)
  } catch (error) {
    console.error(error)
  }
}

const controlPagination = function (goToPage) {
  //1 rendering NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage))

  //2 render NEW pagination page
  paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
  //1 Update the recipe serving (in state)
  model.updateServings(newServings)

  //2 Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function () {
  //1 Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)
  //2 Update recipe view
  recipeView.update(model.state.recipe)
  //3 Render bookmarks
  bookmarksView.render(model.state.bookmarked)
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarked)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner()

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe)

    // Render recipe
    recipeView.render(model.state.recipe)

    // Success message
    addRecipeView.renderMessage()

    // Render the bookmark view
    bookmarksView.render(model.state.bookmarked)

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error(`@_@_@_@_@ ${err}`)
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()
