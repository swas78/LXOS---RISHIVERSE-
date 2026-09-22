import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 3010;

app.listen(port, () => {
    console.info(
        `[server] rishiverse-backend-module-scaffold listening on http://localhost:${port}`,
    );
    console.info(`[server] try GET /api/v1/demo/item/all`);
});
