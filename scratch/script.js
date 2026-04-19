const fs = require('fs');
let content = fs.readFileSync('./src/data/moviesData.js', 'utf8');
content = content.replace(/export const /g, 'const ');
content = content.replace(/export const /g, 'const ');
content = content + "\nconsole.log('18:', movies.find(m => m.date === '2026-04-18')?.title);" +
                    "\nconsole.log('19:', movies.find(m => m.date === '2026-04-19')?.title);" +
                    "\nconsole.log('20:', movies.find(m => m.date === '2026-04-20')?.title);" +
                    "\nconsole.log('21:', movies.find(m => m.date === '2026-04-21')?.title);" +
                    "\nconsole.log('22:', movies.find(m => m.date === '2026-04-22')?.title);";
fs.writeFileSync('./scratch/evalMovies.js', content);
