export class TransactionResult<R> {
  private ok: boolean;
  private error: string | undefined;
  private result: R | undefined;

  constructor(ok: boolean, result?: R, error?: string) {
    this.ok = ok;
    this.error = error;
    this.result = result;
  }

  public isOk() {
    return this.ok;
  }

  public isError() {
    return !this.ok;
  }

  public getError() {
    return this.error;
  }

  public getResult() {
    return this.result;
  }
}
