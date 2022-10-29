import appFactory from "fauxauth";

const app = appFactory({});
const port = parseInt(process.env.PORT ?? "3000", 10);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`listening on ${port}`));
