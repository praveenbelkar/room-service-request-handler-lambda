# Room Info Api

## Template

The project is using [handlebars](https://handlebarsjs.com/guide/) to do the data transformation. Handlebars template file is located at ```./api/dtoSchema/template/*.hbs```

## Handlebars Precompile
In order to improve the performance the 
[handlebars precompile](https://handlebarsjs.com/installation/precompilation.html#getting-started) 
mechanism is being used in this application. The following steps should be 
performed every time any *.hbs file is modified.

```
npm run handlebars
```

It will generate a javascript file named roomTemplate.js that should be checked 
into source control

## Environment variables

| Name                         | Required | Default |
|------------------------------|----------|---------|
| DB_HOST                      | Y        |         |
| DB_PORT                      | Y        |         |
| DB_NAME                      | Y        |         |
| DB_USER                      | Y        |         |
| DB_PASSWORD                  | Y        |         |
| DB_SCHEMA                    | N        | public  |
| DB_TABLE                     | N        | room    |
| DB_CONNECTION_MAX_RETRY      | N        | 2       |
| DB_CONNECTION_RETRY_INTERVAL | N        | 500     |

