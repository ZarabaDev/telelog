import winston from "winston";
import { telegramWinstonTransport } from "telelog-js/winston";

const logger = winston.createLogger({
  transports: [telegramWinstonTransport()],
});

logger.info("ping do Node ✅");
