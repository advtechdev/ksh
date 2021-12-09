enum ERROR_CODES {
  Payment = 1000,
  Reschedule,
  CurrencyError,
  APIError,
  CalcError,
  TierError,
  LocationError,
  CircleError,
  ClientError
}

abstract class BizError extends Error {
  public code = 0
}

class PaymentError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.Payment
  }
}

class RescheduleError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.Reschedule
  }
}

class CurrencyError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.CurrencyError
  }
}

class APIError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.APIError
  }
}

class CalcError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.APIError
  }
}

class TierError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.TierError
  }
}

class LocationError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.LocationError
  }
}

class CircleError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.CircleError
  }
}

class ClientError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.ClientError
  }
}

class DateError extends BizError {
  constructor(msg: string) {
    super(msg)
    this.code = ERROR_CODES.ClientError
  }
}

export {
  RescheduleError,
  PaymentError,
  CurrencyError,
  APIError,
  CalcError,
  TierError,
  LocationError,
  CircleError,
  ClientError,
  DateError
}
