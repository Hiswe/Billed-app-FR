import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from './Logout.js'

export const filteredBills = (data, status) => {
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition

        // in jest environment
        if (typeof jest !== 'undefined') {
          selectCondition = bill.status === status
        } else {
          // in prod environment
          const userEmail = JSON.parse(localStorage.getItem('user')).email
          selectCondition = bill.status === status && [...USERS_TEST, userEmail].includes(bill.email)
        }

        return selectCondition
      })
    : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ? firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ? firstAndLastNames.split('.')[1] : firstAndLastNames

  return `
    <div class='bill-card' data-bill-id="${bill.id}" id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map((bill) => card(bill)).join('') : ''
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return 'pending'
    case 2:
      return 'accepted'
    case 3:
      return 'refused'
  }
}

export default class {
  constructor({ document, onNavigate, firestore, bills = [], localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore

    // make the header clickable
    $(`.status-bills-header`).on(`click`, (event) => {
      const $icon = event.currentTarget.querySelector(`.arrow-icon`)
      if (!$icon) return
      const iconId = $icon.getAttribute(`id`)
      const { 1: indexAsString } = /(\d)$/.exec(iconId)
      const index = Number.parseInt(indexAsString, 10)
      if (Number.isNaN(index)) return
      this.handleShowTickets(bills, index)
    })

    // use Vanilla JS to have a better support of event delegation into tests
    // feeds might not already have  been rendered (
    // • waiting for Fetch request to end
    // • a new instance will be created after that
    const $billsFeed = document.querySelector(`.bills-feed`)
    if ($billsFeed) {
      $billsFeed.addEventListener(`click`, (event) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        const $billCard = event.target.matches(`.bill-card`) ? event.target : event.target.closest(`.bill-card`)
        if (!$billCard) return
        const { billId } = $billCard.dataset
        if (!billId) return
        const bill = bills.find((bill) => bill.id === billId)
        if (!bill) return
        this.handleEditTicket(bill, bills)
      })
    }

    this.getBillsAllUsers()
    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye() {
    const billUrl = $('#icon-eye-d').attr('data-bill-url')
    $('#modaleFileAdmin1')
      .find('.modal-body')
      .html(`<div class="modal-image-wrapper" style='text-align: center;'><img src=${billUrl} /></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleEditTicket(bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter++
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter++
    }
    $('#icon-eye-d').on(`click`, () => this.handleClickIconEye())
    $('#btn-accept-bill').on(`click`, () => this.handleAcceptSubmit(bill))
    $('#btn-refuse-bill').on(`click`, () => this.handleRefuseSubmit(bill))
  }

  handleAcceptSubmit(bill) {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val(),
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit(bill) {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val(),
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })
      $(`#status-bills-container${this.index}`).html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter++
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })
      $(`#status-bills-container${this.index}`).html('')
      this.counter++
    }
    return bills
  }

  // not need to cover this function by tests
  getBillsAllUsers() {
    if (!this.firestore) return
    return this.firestore
      .bills()
      .get()
      .then((snapshot) => {
        const bills = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date,
          status: doc.data().status,
        }))
        return bills
      })
      .catch(console.log)
  }

  // not need to cover this function by tests
  updateBill(bill) {
    if (!this.firestore) return
    return this.firestore
      .bill(bill.id)
      .update(bill)
      .then((bill) => bill)
      .catch(console.log)
  }
}
