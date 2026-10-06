// Original vector character art. SVGs are also exported as offline game assets.
export const CHARACTER_STYLES:Record<string,{hair:string;coat:string;cape:string;skin:string;kind:string}>={
 knife:{hair:'#e6edf1',coat:'#86b879',cape:'#c45c56',skin:'#efc6a1',kind:'knife'},
 toxic:{hair:'#446659',coat:'#83b89a',cape:'#dfdfb0',skin:'#efc9a5',kind:'toxic'},
 frost:{hair:'#e9f4fd',coat:'#699dc2',cape:'#b2e2ef',skin:'#efd2bb',kind:'frost'},
 forge:{hair:'#865347',coat:'#b78c68',cape:'#d5b17c',skin:'#dca27c',kind:'forge'},
 coin:{hair:'#dfb856',coat:'#d1af61',cape:'#856746',skin:'#f1cda6',kind:'coin'},
 blood:{hair:'#d38ca5',coat:'#976075',cape:'#b54e64',skin:'#f0c3b1',kind:'blood'},
 hex:{hair:'#b695d7',coat:'#8c78b2',cape:'#6a5688',skin:'#e8c6bb',kind:'hex'},
 bomb:{hair:'#d89055',coat:'#c89068',cape:'#8c674e',skin:'#f4c6a2',kind:'bomb'},
 engineer:{hair:'#6bada6',coat:'#6d9c94',cape:'#d9ba7b',skin:'#efc4a2',kind:'engineer'},
 raven:{hair:'#d2c8e0',coat:'#72668e',cape:'#504964',skin:'#ebcbbd',kind:'raven'},
 spark:{hair:'#e1c66d',coat:'#cfc591',cape:'#ede2b5',skin:'#f3ccac',kind:'spark'},
 fortune:{hair:'#e5cfaa',coat:'#c5a58b',cape:'#85956b',skin:'#f3ceb3',kind:'fortune'},
};
const shade=(c:string,n:number)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(c.slice(i,i+2),16)+n)).toString(16).padStart(2,'0')).join('');
export function characterDrawing(id:string){
 const p=CHARACTER_STYLES[id]||CHARACTER_STYLES.knife,k=p.kind;
 let head='',weapon='';
 if(['knife','blood','spark'].includes(k))head=`<path d="M23 28 21 18 32 21 30 10 42 16 49 6 54 17 67 11 65 22 75 20 72 34 61 27 53 31 48 21 39 31Z" fill="${p.hair}"/><path d="M30 22 39 16 46 18" fill="none" stroke="${shade(p.hair,22)}" stroke-width="3"/>`;
 if(k==='toxic'||k==='engineer'||k==='bomb')head=`<path d="M23 29Q24 9 45 10Q66 5 74 32L65 27 57 31 48 22 37 28Z" fill="${p.hair}"/><path d="M25 26H70" stroke="#775b41" stroke-width="7"/><circle cx="35" cy="25" r="8" fill="#dbc083"/><circle cx="61" cy="25" r="8" fill="#dbc083"/><circle cx="35" cy="25" r="5" fill="#a4d5cf"/><circle cx="61" cy="25" r="5" fill="#a4d5cf"/>`;
 if(k==='frost')head=`<path d="M21 31 25 17 34 20 39 7 48 16 58 5 63 20 71 18 76 32 64 28 48 30 31 29Z" fill="#aad8ec"/><path d="M25 31 24 49 29 56 33 30M71 31 72 49 67 56 64 30" fill="#81b5d2"/><path d="M31 23 39 18 47 23 58 17 66 26" fill="none" stroke="#e1f6fc" stroke-width="3"/>`;
 if(k==='forge')head=`<path d="M23 31Q21 8 47 8Q72 8 74 31Z" fill="#b99b77"/><path d="M21 31H76" stroke="#715449" stroke-width="6"/><path d="M40 11H55V27H40Z" fill="#d0b689"/><path d="M30 49 37 58 47 64 59 57 66 49 61 52 57 46 48 52 39 46 35 53Z" fill="${p.hair}"/>`;
 if(k==='coin'||k==='fortune')head=`<path d="M26 27 29 14Q46 6 66 14L69 27Z" fill="${p.hair}"/><path d="M23 25H74L77 31Q49 37 20 31Z" fill="${p.coat}"/><path d="M31 22H65" stroke="${p.cape}" stroke-width="5"/><circle cx="55" cy="22" r="4" fill="#eed58b"/>`;
 if(k==='hex')head=`<path d="M22 30 42 5 53 3 62 25 77 29 72 36 21 36 15 31Z" fill="#8570a9"/><path d="M32 25 64 25" stroke="#c4a7d9" stroke-width="6"/><path d="M44 11 46 20" stroke="#aa92c6" stroke-width="3"/>`;
 if(k==='raven')head=`<path d="M21 37Q16 13 45 8Q75 7 77 40L69 49 67 33 58 22 42 25 29 35 30 49Z" fill="#72628c"/><path d="M23 20 16 14 23 11 28 20" fill="#50435f"/>`;
 const knife=`<path d="M15 78 12 56 20 62 22 80Z" fill="#dbe7e8"/><path d="M11 80H25" stroke="#d5b56a" stroke-width="4"/><path d="M18 83 20 91" stroke="#6a615d" stroke-width="4"/>`;
 if(k==='knife'||k==='blood')weapon=knife+`<g transform="translate(96 0) scale(-1 1)">${knife}</g>`;
 if(k==='toxic')weapon='<path d="M76 61V72L83 85Q81 91 70 87L64 81 71 70 72 60Z" fill="#8ccc94"/><path d="M71 61H77" stroke="#dac999" stroke-width="4"/><path d="M67 79 78 75" stroke="#ceefaa" stroke-width="3"/>';
 if(k==='frost')weapon='<path d="M17 39V103" stroke="#9faec4" stroke-width="4"/><path d="M17 23 8 40 17 45 27 38Z" fill="#a6e5f3"/><path d="M17 27V40" stroke="#edffff" stroke-width="2"/>';
 if(k==='forge')weapon='<path d="M16 62 25 107" stroke="#74604e" stroke-width="5"/><path d="M12 53 3 64 6 79 18 78 32 69 26 58Z" fill="#a5bbc3"/><path d="M7 64 9 74 19 72" fill="none" stroke="#e3e8da" stroke-width="3"/>';
 if(k==='coin')weapon='<circle cx="78" cy="75" r="12" fill="#d8b257"/><circle cx="78" cy="75" r="8" fill="#f1d884"/><path d="M78 69V81M74 72H82M74 78H82" stroke="#b58945" stroke-width="2"/>';
 if(k==='hex')weapon='<path d="M17 49 15 106" stroke="#b6a187" stroke-width="4"/><path d="M10 41 17 34 24 42 18 51Z" fill="#c6a1e8"/><circle cx="17" cy="41" r="3" fill="#eee0ff"/>';
 if(k==='bomb')weapon='<circle cx="76" cy="77" r="13" fill="#4b4d54"/><path d="M74 63 76 57 81 60" fill="none" stroke="#d2b187" stroke-width="3"/><path d="M81 60 85 53 88 61 83 65Z" fill="#efc879"/><circle cx="72" cy="73" r="4" fill="#7e7b77"/>';
 if(k==='engineer')weapon='<path d="M12 71 23 71 27 82 23 90 6 90 6 81Z" fill="#9fb3a8"/><path d="M17 69V59" stroke="#657f7b" stroke-width="5"/><path d="M5 92H27" stroke="#785f48" stroke-width="4"/>';
 if(k==='raven')weapon='<path d="M72 60 88 72 82 88 69 84 78 75Z" fill="#a595c5"/><path d="M75 66 82 73 77 80" fill="none" stroke="#d2c5e6" stroke-width="3"/>';
 if(k==='spark')weapon='<path d="M16 57 4 74 14 76 9 96 29 73 20 70 26 56Z" fill="#ecd674"/><path d="M13 73 19 68" stroke="#fff4b3" stroke-width="3"/>';
 if(k==='fortune')weapon='<circle cx="77" cy="79" r="12" fill="#bc9e6d"/><circle cx="77" cy="79" r="8" fill="#dfd5b8"/><path d="M77 71 73 80 81 87 80 77Z" fill="#8da79c"/><circle cx="77" cy="79" r="2" fill="#e8d5a3"/>';
 return `<g stroke="#39434a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M31 60 19 90 29 101 43 92 52 100 74 93 67 63Z" fill="${p.cape}"/><path d="M37 87 34 105H44L49 89 54 106H66L61 87Z" fill="${shade(p.coat,-35)}"/><path d="M33 101 31 111Q39 116 46 112L45 102Z" fill="#5b554f"/><path d="M54 103 54 112Q65 116 69 111L65 102Z" fill="#5b554f"/><path d="M29 65 19 77 25 84 36 75M65 65 76 76 71 84 59 75" fill="${p.coat}"/><ellipse cx="23" cy="83" rx="5" ry="5" fill="${p.skin}"/><ellipse cx="73" cy="83" rx="5" ry="5" fill="${p.skin}"/><path d="M32 60Q49 54 65 61L66 87Q51 96 30 86Z" fill="${p.coat}"/><path d="M35 65 37 82 59 85" fill="none" stroke="${shade(p.coat,22)}" stroke-width="4"/><path d="M31 86H65" stroke="#735f4d" stroke-width="6"/><rect x="45" y="82" width="10" height="8" rx="2" fill="#d5b46c"/><ellipse cx="23" cy="39" rx="5" ry="8" fill="${p.skin}"/><ellipse cx="73" cy="39" rx="5" ry="8" fill="${p.skin}"/><path d="M24 32Q22 15 47 14Q74 14 73 36L72 44Q68 61 49 62Q26 60 24 44Z" fill="${p.skin}"/><path d="M30 47Q32 56 44 56" fill="none" stroke="${shade(p.skin,18)}" stroke-width="5"/><path d="M31 34 40 33M57 33 65 35" stroke="#59504f" stroke-width="2"/><ellipse cx="37" cy="41" rx="5" ry="7" fill="#faf7e9" stroke-width="1.1"/><ellipse cx="60" cy="41" rx="5" ry="7" fill="#faf7e9" stroke-width="1.1"/><ellipse cx="38" cy="42" rx="3" ry="5" fill="#4d626b" stroke="none"/><ellipse cx="59" cy="42" rx="3" ry="5" fill="#4d626b" stroke="none"/><circle cx="39" cy="40" r="1.4" fill="#fff" stroke="none"/><circle cx="60" cy="40" r="1.4" fill="#fff" stroke="none"/><path d="M45 51Q49 54 53 51" fill="none" stroke="#aa6f66" stroke-width="1.5"/><ellipse cx="30" cy="49" rx="4" ry="2" fill="#e2a796" stroke="none" opacity=".7"/><ellipse cx="67" cy="49" rx="4" ry="2" fill="#e2a796" stroke="none" opacity=".7"/>${head}<path d="M30 59Q48 64 66 59L64 66Q49 71 31 66Z" fill="${p.cape}"/>${weapon}</g>`;
}
export function characterSVG(id:string){return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="120" viewBox="0 0 96 120">${characterDrawing(id)}</svg>`;}
export function characterIcon(id:string,size:number){return `<svg class="chibi-svg" width="${size}" height="${size*1.25}" viewBox="0 0 96 120" aria-hidden="true">${characterDrawing(id)}</svg>`;}
