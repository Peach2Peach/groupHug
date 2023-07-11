export class TransactionResult {
  private ok: boolean
  private error: string
  private result: any

  constructor (ok: boolean, result?: any, error?: string) {
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

  public getResult (): any {
    return this.result
  }
}
