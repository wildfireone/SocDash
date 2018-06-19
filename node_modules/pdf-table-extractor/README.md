# pdf-table-extractor
Extractor tables from PDF

Web DEMO: https://ronnywang.github.io/pdf-table-extractor/


# Install

```
npm install pdf-table-extractor
```

# Example

test.js

```js
var pdf_table_extractor = require("pdf-table-extractor");

//PDF parsed
function success(result)
{
   console.log(JSON.stringify(result));
}

//Error
function error(err)
{
   console.error('Error: ' + err);
}

pdf_table_extractor("temp.pdf",success,error);

```


```
node test.js
```



