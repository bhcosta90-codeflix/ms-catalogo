export default {
    rest: {
        port: +(process.env.PORT ?? 3000),
        host: process.env.HOST,
        // The `gracePeriodForClose` provides a graceful close for http/https
        // servers with keep-alive clients. The default value is `Infinity`
        // (don't force-close). If you want to immediately destroy all sockets
        // upon stop, set its value to `0`.
        // See https://www.npmjs.com/package/stoppable
        gracePeriodForClose: 5000, // 5 seconds
        openApiSpec: {
            // useful when used with OpenAPI-to-GraphQL to locate your application
            setServersFromRequest: true,
        },
    },
    rabbitmq: {
        uri: process.env.RABBITMQ_URI,
        defaultHandler: parseInt(<string>process.env.RABBITMQ_HANDLER_ERROR)
        // exchanges: [
        //   {name: 'teste1', type: "direct"},
        //   {name: 'teste2', type: "direct"}
        // ]
    }
}