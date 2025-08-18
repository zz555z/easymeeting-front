const regs = {
  number: /^\d{1,}$/,
  password: /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*_]{8,}$/,
  version: /^[0-9.]+$/,
  email: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
}

const verify = (rule, value, reg, callback) => {
  if (value) {
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error(rule.message))
    }
  } else {
    callback()
  }
}

const checkPassword = (value) => {
  return regs.password.test(value)
}

const checkEmail = (value) => {
  return regs.email.test(value)
}

const password = (rule, value, callback) => {
  return verify(rule, value, regs.password, callback)
}

const number = (rule, value, callback) => {
  return verify(rule, value, regs.number, callback)
}

export default {
  password,
  number,
  checkPassword,
  checkEmail
}
