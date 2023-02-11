import appFactory from "./app.js";

const port = parseInt(process.env.PORT ?? "3000", 10);

const app = appFactory();

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`gitstub listening on ${port}`);
});
