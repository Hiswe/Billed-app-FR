import { fireEvent, screen, waitFor } from '@testing-library/dom'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'

describe('Given I am connected as an employee', () => {
  const onNavigate = jest.fn()
  const FIRESTORE_URL = `/firestore/chuckNorris.png`
  const getDownloadURL = jest.fn().mockResolvedValue(FIRESTORE_URL)
  const storagePut = jest.fn().mockResolvedValue({ ref: { getDownloadURL } })
  const storageRef = jest.fn().mockReturnValue({ put: storagePut })
  const addBill = jest.fn().mockResolvedValue(true)
  const bills = jest.fn().mockReturnValue({ add: addBill })
  const firestore = {
    storage: { ref: storageRef },
    bills,
  }
  const localStorageGetItem = jest.fn().mockReturnValue(JSON.stringify({ email: `johndoe@email.com` }))
  const localStorage = { getItem: localStorageGetItem }

  beforeAll(() => {
    jest.spyOn(NewBill.prototype, `handleChangeFile`)
    jest.spyOn(NewBill.prototype, `uploadFile`)
    jest.spyOn(NewBill.prototype, `getBill`)
    jest.spyOn(NewBill.prototype, `createBill`)
    jest.spyOn(NewBill.prototype, `handleSubmit`)
  })

  beforeEach(() => {
    const html = NewBillUI()
    document.body.innerHTML = html
  })

  afterEach(() => jest.clearAllMocks())

  describe('When I am on NewBill Page', () => {
    test(`Then I should be able to submit a valid form`, async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      })

      fireEvent.change(screen.getByTestId(`expense-type`), { target: { value: `Transports` } })
      fireEvent.change(screen.getByTestId(`expense-name`), { target: { value: `expense-name` } })
      fireEvent.change(screen.getByTestId(`datepicker`), { target: { value: `2021-12-12` } })
      fireEvent.change(screen.getByTestId(`amount`), { target: { value: `348` } })
      fireEvent.change(screen.getByTestId(`vat`), { target: { value: `70` } })
      fireEvent.change(screen.getByTestId(`file`), {
        target: {
          files: [new File(['(⌐□_□)'], 'chuckNorris.png', { type: 'image/png' })],
        },
      })
      await waitFor(() => expect(newBill.fileUrl).toBe(FIRESTORE_URL))
      fireEvent.submit(screen.getByTestId(`form-new-bill`))
      expect(newBill.handleSubmit).toHaveBeenCalled()
      expect(newBill.getBill).toHaveBeenCalled()
      const EXPECTED_BILL = {
        'amount': 348,
        'commentary': '',
        'date': '2021-12-12',
        'email': 'johndoe@email.com',
        'fileName': 'chuckNorris.png',
        'fileUrl': '/firestore/chuckNorris.png',
        'name': 'expense-name',
        'pct': 20,
        'status': 'pending',
        'type': 'Transports',
        'vat': 70,
      }
      expect(newBill.getBill).toHaveReturnedWith(EXPECTED_BILL)
      expect(newBill.createBill).toHaveBeenCalled()
      expect(bills).toHaveBeenCalled()
      await waitFor(() => expect(addBill).toHaveBeenCalled())
      expect(addBill).toHaveBeenCalledWith(EXPECTED_BILL)
      await waitFor(() => expect(onNavigate).toHaveBeenCalled())
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
    })

    test('Then I should be able to upload files', async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      })

      const $fileInput = screen.getByTestId(`file`)
      fireEvent.change($fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'chuckNorris.png', { type: 'image/png' })],
        },
      })
      expect(newBill.handleChangeFile).toHaveBeenCalled()
      expect(newBill.uploadFile).toHaveBeenCalled()
      expect(storageRef).toHaveBeenCalled()
      await waitFor(() => expect(storagePut).toHaveBeenCalled())
      await waitFor(() => expect(getDownloadURL).toHaveBeenCalled())
      await waitFor(() => expect(newBill.fileUrl).toBe(FIRESTORE_URL))
      await waitFor(() => expect(newBill.fileName).toBe('chuckNorris.png'))
      // form is incomplete => not posting!
      expect(newBill.createBill).not.toHaveBeenCalled()
    })

    test(`Then I shouldn't be able to upload files from the wrong format`, () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      })

      const $fileInput = screen.getByTestId(`file`)
      fireEvent.change($fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'chuckNorris.bmp', { type: 'image/bmp' })],
        },
      })
      expect(newBill.handleChangeFile).toHaveBeenCalled()
      // file is invalid => not uploading!
      expect(newBill.uploadFile).not.toHaveBeenCalled()
      expect(newBill.fileUrl).toBe(null)
      expect(newBill.fileName).toBe(null)
      // form is incomplete => not posting!
      expect(newBill.createBill).not.toHaveBeenCalled()
    })
  })
})
