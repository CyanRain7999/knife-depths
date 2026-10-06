import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
// Original pixel art. Regenerate with: node scripts/icons.mjs
const art=[
 '................','.......xx.......','......xxxx......','......xxxx......','......xxxx......','......xxxx......','......xxxx......','......xxxx......','......xxxx......','.....gxxxxg.....','....gggggggg....','.......gg.......','.......gg.......','......gggg......','................','................'
];
function crc(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(name,data){const n=Buffer.from(name),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([n,data])));return Buffer.concat([len,n,data,sum]);}
function icon(size,maskable=false){const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const offset=y*(size*4+1)+1+x*4;const scale=size/(maskable?24:20),ax=Math.floor((x-size/2)/scale+8),ay=Math.floor((y-size/2)/scale+8);let c=[245,247,236];if(x>size*.1&&x<size*.9&&y>size*.1&&y<size*.9)c=[224,235,207];const char=art[ay]?.[ax];if(char==='x')c=[82,130,78];if(char==='g')c=[211,165,83];raw.set([...c,255],offset);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
mkdirSync('public',{recursive:true});for(const size of [192,512])writeFileSync(`public/icon-${size}.png`,icon(size));writeFileSync('public/icon-maskable.png',icon(512,true));
