export interface ErrorData {
  eventName: string
  data: any
}

enum ERROR_CODES {
  Context = 1000,
  Logic
}

class KError extends Error {
  public code = 0
  // eslint-disable-next-line no-useless-constructor
  constructor(msg: string) {
    super(msg)
  }
}

class ContextError extends KError {
  public code = ERROR_CODES.Context
  // eslint-disable-next-line no-useless-constructor
  constructor(msg: string) {
    super(msg)
  }
}

class LogicError extends KError {
  public code = ERROR_CODES.Logic
  // eslint-disable-next-line no-useless-constructor
  constructor(msg: string) {
    super(msg)
  }
}

export { ContextError, LogicError }
