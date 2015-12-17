var endpoint = 'http://localhost:9999/bigdata/namespace/kb/sparql';
var users = require('./users.js')(endpoint);

function print_error(m) { console.error(m); }

function print_success(m) { console.error(m); }

// users.create({username: 'user1'}).then(print_success).catch(print_error);
// users.create({username: 'user2'}).then(print_success).catch(print_error);
// users.create({username: 'user3'}).then(print_success).catch(print_error);
// users.create({username: 'user4'}).then(print_success).catch(print_error);
// users.create({username: 'user5'}).then(print_success).catch(print_error);
// users.create({username: 'user6'}).then(print_success).catch(print_error);
// users.create({username: 'user7'}).then(print_success).catch(print_error);
// users.create({username: 'user8'}).then(print_success).catch(print_error);
// users.create({username: 'user9'}).then(print_success).catch(print_error);

// users.create({username: 'user1'}).then(users.login).then(print_success).catch(print_error);

users.get('iuser:bc74062e-23ec-49a4-a482-dc6bc1ae5f29').then(print_success).catch(print_error);

// users.delete('iuser:ae512d5b-f40f-497d-bca9-f53b50df7b04').then(print_success).catch(print_error);