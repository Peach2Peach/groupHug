import morgan from "morgan";
import getLogger from "../src/utils/logger";

const logger = getLogger("controller", "All");

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = {
  write: (message: unknown) => logger.http(message),
};

export default morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream },
);
