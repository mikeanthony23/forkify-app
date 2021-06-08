import View from './View.js'
import icons from 'url:../../img/icons.svg'

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination')

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline')
      if (!btn) return
      const goToPage = +btn.dataset.goto
      handler(goToPage)
    })
  }

  _generateMarkup() {
    let currentPage = this._data.page
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    )

    // last page
    if (currentPage === numPages && numPages > 1)
      return this._generateMarkupPrevBtn(currentPage)

    // Other page
    if (currentPage > 1 && numPages > currentPage)
      return this._generateMarkupPrevBtn(currentPage).concat(
        this._generateMarkupNextBtn(currentPage)
      )

    // Page 1, and other pages
    if (currentPage === 1 && numPages > 1)
      return this._generateMarkupNextBtn(currentPage)

    // Page 1,and there are no other pages
    return ``
  }

  _generateMarkupPrevBtn(currPage) {
    return `
    <button data-goto="${
      currPage - 1
    }" class="btn--inline    pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${currPage - 1}</span>
    </button>`
  }

  _generateMarkupNextBtn(currPage) {
    return `
    <button data-goto="${
      currPage + 1
    }" class="btn--inline pagination__btn--next">
      <span>Page ${currPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`
  }
}

export default new PaginationView()
