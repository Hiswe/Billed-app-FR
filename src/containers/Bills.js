import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from '../app/format.js'
import Logout from './Logout.js'

export const formatBill = (doc) => {
  const docData = doc.data()
  return {
    ...docData,
    date: formatDate(docData.date),
    status: formatStatus(docData.status),
  }
}

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = typeof onNavigate === `function` ? onNavigate.bind(this) : () => {}
    this.firestore = firestore
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', (event) => this.handleClickNewBill(event))
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
      })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill() {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye(icon) {
    const billUrl = icon.getAttribute('data-bill-url')
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile')
      .find('.modal-body')
      .html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    $('#modaleFile').modal('show')
  }

  // not need to cover this function by tests
  getBills() {
    if (!this.firestore) return
    const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : ''
    return this.firestore
      .bills()
      .get()
      .then((snapshot) => {
        const bills = snapshot.docs.map(formatBill).filter((bill) => bill.email === userEmail)
        return bills
      })
      .catch((error) => error)
  }
}
