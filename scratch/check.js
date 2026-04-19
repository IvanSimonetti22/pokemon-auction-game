const { movies } = require('../src/data/moviesData.js');

console.log('April 18:', movies.find(m => m.date === '2026-04-18')?.title);
console.log('April 19:', movies.find(m => m.date === '2026-04-19')?.title);
console.log('April 20:', movies.find(m => m.date === '2026-04-20')?.title);
console.log('April 21:', movies.find(m => m.date === '2026-04-21')?.title);
