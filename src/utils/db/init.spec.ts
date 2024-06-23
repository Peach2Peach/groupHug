import { describe, it } from "mocha";
import { DB_AUTH } from "../../../constants";
import { initDatabase } from "./index";

describe("init", () => {
  it("initialise the database connection", async () => {
    await initDatabase({ password: DB_AUTH, database: 9 });
  });
});
