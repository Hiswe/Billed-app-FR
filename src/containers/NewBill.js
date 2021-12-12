import { ROUTES_PATH } from '../constants/routes.js'
import Logout from './Logout.js'

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    this.localStorage = localStorage
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener('submit', (event) => this.handleSubmit(event))
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener('change', (event) => this.handleChangeFile(event))
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile() {
    const $input = this.document.querySelector(`input[data-testid="file"]`)
    const file = $input.files[0]
    const isValidType = /^image\/(jpe?g|png)$/.test(file.type)
    if (!isValidType) {
      this.fileUrl = null
      this.fileName = null
      $input.value = null
      return
    }
    this.uploadFile(file)
  }

  uploadFile(file) {
    if (!this.firestore) return
    this.firestore.storage
      .ref(`justificatifs/${file.name}`)
      .put(file)
      .then((snapshot) => snapshot.ref.getDownloadURL())
      .then((url) => {
        this.fileUrl = url
        this.fileName = file.name
      })
      .catch((error) => console.log(error))
  }

  getBill() {
    try {
      const $form = this.document.querySelector(`form[data-testid="form-new-bill"]`)
      // try catch to handle JSON.parse on localStorage
      const user = JSON.parse(this.localStorage.getItem('user'))
      const email = user?.email ?? false
      if (!email) return
      return {
        email,
        type: $form.querySelector(`select[data-testid="expense-type"]`).value,
        name: $form.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt($form.querySelector(`input[data-testid="amount"]`).value, 10),
        date: $form.querySelector(`input[data-testid="datepicker"]`).value,
        vat: parseInt($form.querySelector(`input[data-testid="vat"]`).value, 10),
        pct: parseInt($form.querySelector(`input[data-testid="pct"]`).value, 10) || 20,
        commentary: $form.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending',
      }
    } catch (error) {
      return {}
    }
  }

  async handleSubmit(event) {
    event.preventDefault()
    const bill = this.getBill()
    const MANDATORY_KEYS = Object.keys(bill).filter((keyName) => ![`pct`, `commentary`].includes(keyName))
    const isValidForm = MANDATORY_KEYS.every((keyName) => bill[keyName] != null && bill[keyName] !== ``)
    if (!isValidForm) return
    await this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  createBill(bill) {
    if (!this.firestore) return
    return this.firestore
      .bills()
      .add(bill)
      .catch((error) => error)
  }
}
