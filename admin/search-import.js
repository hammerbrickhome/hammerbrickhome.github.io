/* Local Search Console CSV viewer; no upload and no storage. */
(() => {
 'use strict';
 function parse(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw Error('CSV has an unmatched quote.');if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}return rows;}
 window.hammerParseSearchCSV=parse;
 document.getElementById('googleCsv').onchange=async e=>{const status=document.getElementById('csvStatus'),table=document.getElementById('csvTable');table.replaceChildren();try{const f=e.target.files[0];if(!f)return;if(f.size>5*1024*1024)throw Error('Choose a CSV under 5 MB.');const rows=parse((await f.text()).replace(/^\uFEFF/,''));rows.slice(0,501).forEach((cells,index)=>{const row=document.createElement('tr');cells.slice(0,20).forEach(value=>{const cell=document.createElement(index?'td':'th');cell.textContent=value;row.append(cell);});table.append(row);});status.textContent=Math.max(0,rows.length-1)+' exported rows. Showing up to 500 rows and 20 columns. Nothing was uploaded.';}catch(error){status.textContent=error.message;}};
})();
