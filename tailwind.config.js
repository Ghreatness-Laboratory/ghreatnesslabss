/** @type {import('tailwindcss').Config} */
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#111111', paper:'#ffffff', 'paper-dark':'#111111', gray:'#555555' }, fontFamily: { display:['Archivo Narrow','Arial Narrow','sans-serif'], body:['Inter','Liberation Sans','sans-serif'], mono:['JetBrains Mono','monospace'] } } }, plugins: [] };
