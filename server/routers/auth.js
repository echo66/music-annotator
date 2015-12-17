module.exports = function(passport){

	var router 			= require('express').Router();
	// var expressSession 	= require('express-session');
	var log4js 			= require('log4js');
	var LocalStrategy 	= require('passport-local').Strategy;
	var mongoose 		= require('mongoose');
	var bCrypt			= require('bcrypt-nodejs');

	var logger = log4js.getLogger();
	log4js.replaceConsole();
	var MONGO_URL = 'mongodb://localhost/mixcollective';

	var User = mongoose.model('User',{
		username: String,
		password: String,
		email: String,
	});
	mongoose.connect(MONGO_URL);

	// router.use(expressSession({secret: 'minhaChaveSecreta', resave: false, saveUninitialized: true }));
	// router.use(passport.initialize());
	// router.use(passport.session({resave: false, saveUninitialized: true}));

	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	}

	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}

	passport.use('signin', new LocalStrategy({ passReqToCallback : true },
		function(req, username, password, done) {

			logger.info(['signin', username, password]);

			// verifica no mongo se o nome de usuário existe ou não
			User.findOne({ 'username' :  username },
				function(err, user) {
					// Em caso de erro, retorne usando o método done
					if (err)
						return done(err);
					// Nome de usuário não existe, logar o erro & redirecione de volta
					if (!user){
						logger.info('Usuário não encontrado para usuário '+username);
						return done(null, false); // 'Usuário não encontrado.'
					}
					// Usuário existe mas a senha está errada, logar o erro
					if (!isValidPassword(user, password)){
						logger.info('Senha Inválida');
						return done(null, false); // 'Senha Inválida'
					}
					// Tanto usuário e senha estão corretos, retorna usuário através 
					// do método done, e, agora, será considerado um sucesso
					logger.info('User found');
					return done(null, user);
				}
			);
	}));

	passport.use('signup', new LocalStrategy({ passReqToCallback : true },
		function(req, username, password, done) {

			logger.info(['signup', username, password]);

			findOrCreateUser = function(){
				// Busca usuário pelo nome apresentado
				User.findOne({'username':username},function(err, user) {
					// Em caso de erro, retornar
					if (err){
						logger.info('Error while searching users collection: ' + err);
						return done(err);
					}
					// Usuário existe
					if (user) {
						logger.info('User already exists');
						return done(null, false); // 'Usuário já existe'
					} else {
						// Se não houver usuário com aquele e-mail
						// criaremos o novo usuário
						var newUser = new User();
						// Atribuindo as credenciais locais
						newUser.username = username;
						newUser.password = createHash(password);
						newUser.email = req.body['email'] || req.params['email'] || req.query['email'];
	 
						// salva o usuário
						newUser.save(function(err) {
							if (err) {
								logger.error('Error while adding new user: ' + err);
								throw err;
							}
							logger.info('New user: ' + newUser.username);
							return done(null, newUser);
						});
	        		}
				});
			};

			// Atrasa a execução do método findOrCreateUser e o executa
			// na próxima oportunidade dentro do loop de eventos
			process.nextTick(findOrCreateUser);
		})
	);

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});
	 
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});
 

	
	router.get('/signin', passport.authenticate('signin', {}), function(req, res) {
		res.status(200).json(req.session);
	});
	
	router.get('/signup', passport.authenticate('signup', {}), function(req, res) {
		res.status(200).json(req.session);
	});

	router.get('/signout', function(req, res) {
		req.logout();
		res.status(200).json(req.session);
	});

	router.get('/status', function(req, res) {
		res.status(200).json(req.session);
	});

	return router;
}