// Local-only verification server: shuts down on request to prove SW offline loading.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve('dist'),prefix='/knife-depths/';
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{
 if(req.url==='/__stop_verification'){res.end('offline verification: server stopped');server.close(()=>process.exit(0));server.closeAllConnections();return;}
 if(!req.url?.startsWith(prefix)){res.writeHead(302,{Location:prefix});res.end();return;}
 const relative=decodeURIComponent(req.url.split('?')[0].slice(prefix.length))||'index.html',file=resolve(root,relative);
 if(file!==root&&!file.startsWith(root+'\\')&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 try{const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end('not found');}
});
const port=Number(process.env.VERIFY_PORT||4174);
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Verification: http://127.0.0.1:${port}/knife-depths/\n`));
