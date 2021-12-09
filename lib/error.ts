export interface ErrorData {
  eventName: string
  data: any
}

enum ERROR_CODES {
  Context = 1000,
  Logic,
}

class KError extends Error {
  public code = 0
  constructor(msg: string) {
    super(msg)
  }
}

class ContextError extends KError {
  public code = ERROR_CODES.Context
  constructor(msg: string) {
    super(msg)
  }
}

class LogicError extends KError {
  public code = ERROR_CODES.Logic
  constructor(msg: string) {
    super(msg)
  }
}


export {
  ContextError,
  LogicError
}
