import cfg from './src/etc/app.json'
import { BunServer } from '@nosh/freebooter'

const server = new BunServer({ ...cfg, appRoot: import.meta.dir })
console.log('Created server', { server })

server.start().then(async () => console.log('Server started'))