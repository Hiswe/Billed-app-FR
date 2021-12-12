import { fireEvent, screen, waitFor } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'

describe('Given I am connected as an employee', () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  beforeAll(() => {
    jest.spyOn(NewBill.prototype, `handleChangeFile`)
    jest.spyOn(NewBill.prototype, `uploadFile`)
    jest.spyOn(NewBill.prototype, `createBill`)
    jest.spyOn(NewBill.prototype, `handleSubmit`)
  })

  afterEach(() => jest.clearAllMocks())

  describe('When I am on NewBill Page', () => {
    test('Then I should be able to upload files', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      })

      const $fileInput = screen.getByTestId(`file`)
      fireEvent.change($fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
        },
      })
      expect(newBill.handleChangeFile).toHaveBeenCalled()
      expect(newBill.uploadFile).toHaveBeenCalled()
      // form is incomplete => not posting!
      expect(newBill.createBill).not.toHaveBeenCalled()
    })

    test('Then I should be able to upload files from the wrong format', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      })

      const $fileInput = screen.getByTestId(`file`)
      fireEvent.change($fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'chucknorris.bmp', { type: 'image/bmp' })],
        },
      })
      expect(newBill.handleChangeFile).toHaveBeenCalled()
      expect(newBill.uploadFile).not.toHaveBeenCalled()
      // form is incomplete => not posting!
      expect(newBill.createBill).not.toHaveBeenCalled()
    })
  })
})
