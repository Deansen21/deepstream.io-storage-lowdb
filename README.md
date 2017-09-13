# deepstream.io-lowdb-storage-connector

DeepStream storage connector for [lowdb](https://www.npmjs.com/package/lowdb), when you just want to store in a JSON file.
This is not for high performance or distributed setup.  I'm using it for embedded
environments. 

```yaml
plugins:
  storage:
    name: deepstream.io-lowdb-storage-connector
    options:
      dbFile: "/path/to/file.json"
      dbBackupFile: "/path/to/backupFile.json"
```
