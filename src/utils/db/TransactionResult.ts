export class TransactionResult<R> {
  private ok: boolean
  private error: string
  private result: R

  constructor (ok: boolean, result?: R, error?: string) {
    this.ok = ok
    this.error = error
    this.result = result
  }

  public isOk (): boolean {
    return this.ok
  }

  public isError (): boolean {
    return !this.ok
  }

  public getError (): string {
    return this.error
  }

  public getResult (): R {
    return this.result
  }
}
