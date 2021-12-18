import { fireEvent, screen } from '@testing-library/dom'

import LoginUI from '../views/LoginUI'
import Login from '../containers/Login.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes'
import * as firestoreMocks from '../__mocks__/firestore.js'

describe('Given that I am a user on login page', () => {
  const onNavigate = jest.fn()
  const localeStorageSetItem = jest.fn()
  const localStorage = {
    setItem: localeStorageSetItem,
  }

  beforeAll(() => {
    jest.spyOn(Login.prototype, `handleSubmitEmployee`)
    jest.spyOn(Login.prototype, `handleSubmitAdmin`)
    jest.spyOn(Login.prototype, `checkIfUserExists`)
    jest.spyOn(Login.prototype, `createUser`)
  })

  afterEach(() => jest.clearAllMocks())

  describe('When I do not fill fields and I click on employee button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId('employee-email-input')
      expect(inputEmailUser.value).toBe('')

      const inputPasswordUser = screen.getByTestId('employee-password-input')
      expect(inputPasswordUser.value).toBe('')

      const form = screen.getByTestId('form-employee')
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId('form-employee')).toBeTruthy()
    })
  })

  describe('When I do fill fields in incorrect format and I click on employee button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId('employee-email-input')
      fireEvent.change(inputEmailUser, { target: { value: 'pasunemail' } })
      expect(inputEmailUser.value).toBe('pasunemail')

      const inputPasswordUser = screen.getByTestId('employee-password-input')
      fireEvent.change(inputPasswordUser, { target: { value: 'azerty' } })
      expect(inputPasswordUser.value).toBe('azerty')

      const form = screen.getByTestId('form-employee')
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId('form-employee')).toBeTruthy()
    })
  })

  describe('When I do fill fields in correct format and I click on employee button Login In', () => {
    test('Then I should be identified as an Employee in app', () => {
      document.body.innerHTML = LoginUI()
      const inputData = {
        email: 'johndoe@email.com',
        password: 'azerty',
      }

      const inputEmailUser = screen.getByTestId('employee-email-input')
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } })
      expect(inputEmailUser.value).toBe(inputData.email)

      const inputPasswordUser = screen.getByTestId('employee-password-input')
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } })
      expect(inputPasswordUser.value).toBe(inputData.password)

      const form = screen.getByTestId('form-employee')

      let PREVIOUS_LOCATION = ''

      const login = new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        firestore: firestoreMocks.firestore,
      })

      fireEvent.submit(form)
      expect(login.handleSubmitEmployee).toHaveBeenCalled()
      expect(localeStorageSetItem).toHaveBeenCalled()
      expect(localeStorageSetItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: inputData.email,
          password: inputData.password,
          status: 'connected',
        }),
      )
    })
  })

  describe('When I do not fill fields and I click on admin button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId('admin-email-input')
      expect(inputEmailUser.value).toBe('')

      const inputPasswordUser = screen.getByTestId('admin-password-input')
      expect(inputPasswordUser.value).toBe('')

      const form = screen.getByTestId('form-admin')
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId('form-admin')).toBeTruthy()
    })
  })

  describe('When I do fill fields in incorrect format and I click on admin button Login In', () => {
    test('Then it should renders Login page', () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId('admin-email-input')
      fireEvent.change(inputEmailUser, { target: { value: 'pasunemail' } })
      expect(inputEmailUser.value).toBe('pasunemail')

      const inputPasswordUser = screen.getByTestId('admin-password-input')
      fireEvent.change(inputPasswordUser, { target: { value: 'azerty' } })
      expect(inputPasswordUser.value).toBe('azerty')

      const form = screen.getByTestId('form-admin')
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId('form-admin')).toBeTruthy()
    })
  })

  describe('When I do fill fields in correct format and I click on admin button Login In', () => {
    test('Then I should be identified as an HR admin in app', () => {
      document.body.innerHTML = LoginUI()
      const inputData = {
        type: 'Admin',
        email: 'johndoe@email.com',
        password: 'azerty',
        status: 'connected',
      }

      const inputEmailUser = screen.getByTestId('admin-email-input')
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } })
      expect(inputEmailUser.value).toBe(inputData.email)

      const inputPasswordUser = screen.getByTestId('admin-password-input')
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } })
      expect(inputPasswordUser.value).toBe(inputData.password)

      const form = screen.getByTestId('form-admin')
      let PREVIOUS_LOCATION = ''

      const login = new Login({
        document,
        localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        firestore: firestoreMocks.firestore,
      })

      fireEvent.submit(form)
      const USER = {
        type: 'Admin',
        email: inputData.email,
        password: inputData.password,
        status: 'connected',
      }
      expect(login.handleSubmitAdmin).toHaveBeenCalled()
      expect(localeStorageSetItem).toHaveBeenCalled()
      expect(localeStorageSetItem).toHaveBeenCalledWith('user', JSON.stringify(USER))
      expect(login.createUser).toHaveBeenCalled()
      expect(login.createUser).toHaveBeenCalledWith(USER)
      expect(firestoreMocks.docUsers).toHaveBeenCalled()
      expect(firestoreMocks.docUsers).toHaveBeenCalledWith(USER.email)
      expect(firestoreMocks.setUsers).toHaveBeenCalled()
      expect(firestoreMocks.setUsers).toHaveBeenCalledWith({
        type: 'Admin',
        name: 'johndoe',
      })
      expect(onNavigate).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Dashboard)
    })
  })
})
