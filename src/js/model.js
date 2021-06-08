import { async } from 'regenerator-runtime'
import {
  API_URL,
  RESULT_MAX_PAGE,
  DEFAULT_STARTING_PAGE,
  KEY,
} from './config.js'

//import { getJSON, sendJSON, } from './helpers.js'
import { AJAX } from './helpers.js'

export const state = {
  recipe: {},
  search: {
    queries: [],
    results: [],
    resultsPerPage: RESULT_MAX_PAGE,
    page: DEFAULT_STARTING_PAGE,
  },
  bookmarked: [],
}

const createRecipeObject = function (data) {
  const { recipe } = data.data
  return {
    cookingTime: recipe.cooking_time,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    title: recipe.title,
    id: recipe.id,
    ...(recipe.key && { key: recipe.key }),
  }
}

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}`)

    state.recipe = createRecipeObject(data)

    if (state.bookmarked.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true
    else state.recipe.bookmarked = false

    console.log(state.recipe)
  } catch (err) {
    console.error(`${err}@@@@@@@@@`)
    throw err
  }
}

export const loadSearchResults = async function (query) {
  try {
    state.search.queries = query
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)
    const { recipes } = data.data
    state.search.results = recipes.map(recipe => {
      return {
        image: recipe.image_url,
        publisher: recipe.publisher,
        title: recipe.title,
        id: recipe.id,
        ...(recipe.key && { key: recipe.key }),
      }
    })

    if (state) state.search.page = DEFAULT_STARTING_PAGE
  } catch (err) {
    console.error(`${err}@@@@@@@@@`)
    throw err
  }
}

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page
  const start = (page - 1) * state.search.resultsPerPage
  const end = page * state.search.resultsPerPage

  return state.search.results.slice(start, end)
}

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings
    // newQt = oldQt + newServings / oldServings // 2 * 8 / 4 * 4
  })

  state.recipe.servings = newServings
}

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarked))
}

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarked.push(recipe)
  // Add recipe bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true
  persistBookmark()
}

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarked.findIndex(el => el.id === id)
  state.bookmarked.splice(index, 1)
  // Mark current recipe as NOT Bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false
  persistBookmark()
}

const init = function () {
  const storage = localStorage.getItem('bookmarks')
  if (storage) state.bookmarked = JSON.parse(storage)
}
init()

//console.log(state.bookmarked)

const clearBookmarks = function () {
  localStorage.clear('bookmarks')
}

//clearBookmarks()

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const imgArr = ing[1].split(',').map(el => el.trim())
        if (imgArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use the correct format'
          )
        const [quantity, unit, description] = imgArr
        return { quantity: quantity ? +quantity : null, unit, description }
      })

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    }
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe)
    state.recipe = createRecipeObject(data)
    addBookmark(state.recipe)
  } catch (err) {
    throw err
  }
}
