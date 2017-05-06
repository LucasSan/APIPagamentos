// Atender todas as rotas que envolvam pagamentos.

module.exports = function(app) {
	app.get('/pagamentos', function(req, res) {
		console.log('Recebida requisicao de teste.');
		res.send('OK.');
	});

	// cancelar pagamento
	app.delete('/pagamentos/pagamento/:id', function(req, res) {
		var pagamento = {};

		// recupera paramentos;
		var id = req.params.id;

		pagamento.id = id;
		pagamento.status = 'CANCELADO';

		var connection = app.persistencia.connectionFactory();
		var pagamentoDao = app.persistencia.PagamentoDAO(connection);

		pagamentoDao.atualiza(pagamento, function(erro) {
			if (erro) {
				res.status(500).send(erro);
				return;
			}

			console.log('pagamento cancelado.');
			res.status(204).send(pagamento);
		});

	});

	app.put('/pagamentos/pagamento/:id', function(req, res) {
		var pagamento = {};

		// recupera paramentos;
		var id = req.params.id;

		pagamento.id = id;
		pagamento.status = 'CONFIRMADO';

		var connection = app.persistencia.connectionFactory();
		var pagamentoDao = app.persistencia.PagamentoDAO(connection);

		pagamentoDao.atualiza(pagamento, function(erro) {
			if (erro) {
				res.status(500).send(erro);
				return;
			}

			res.send(pagamento);
		});

	});

	app.post('/pagamentos/pagamento', function(req, res) {
		
		req.assert("pagamento.forma_de_pagamento", "Forma de pagamento é obrigatório.").notEmpty();
		req.assert("pagamento.valor", "Valor é obrigatório e deve ser um decimal.").notEmpty().isFloat();
		req.validationErrors();

		if (erros) {
			console.log('Erros de validação encontrados : ' + erros);
			res.status(400).send(erros);
			return;
		}

		var pagamento = req.body["pagamento"];
		console.log('processando uma requisição de um novo pagamento');
		
		pagamento.status = 'CRIADO';
		pagamento.data = new Date;

		var connection = app.persistencia.connectionFactory();
		var pagamentoDao = app.persistencia.PagamentoDAO(connection);

		pagamentoDao.salva(pagamento, function(erro, resultado) {

			if (erro) {
				console.log('Erro ao inserir no banco: ' + erro);
				res.status(500).send(erro);
			} else {
				pagamento.id = resultado.insertId;
				console.log('pagamento criado');

				if (pagamento.forma_de_pagamento == 'cartao'){
					var cartao = req.body['cartao'];
					console.log(cartao);

					var clienteCartoes = new app.servicos.clienteCartoes();
					clienteCartoes.autoriza(cartao, function(exception, request, response, retorno) {
						if (exception) {
							console.log(exception);
							res.status(400).send(exception);
							return;
						}

						console.log(retorno);
						res.location('/pagamentos/pagamento/' + pagamento.id);

						var response = {
							dados_do_pagamento: pagamento,
							cartao: retorno,
							links: [
								{
									href: 'http://localhost:3000/pagamentos/pagamento/' + pagamento.id,
									rel: 'confirmar',
									method: 'PUT'
								},
								{
									href: 'http://localhost:3000/pagamentos/pagamento/' + pagamento.id,
									rel: 'cancelar',
									method: 'DELETE'
								},
							]
						}

						res.status(201).json(response);
						return;
					});					
				}

				if (pagamento.forma_de_pagamento == 'cartao') {
					var cartao = req.body["cartao"];
					console.log(cartao);

					clienteCartoes.autoriza(cartao);

					return;
				} else {

				res.location('/pagamentos/pagamento/' + pagamento.id);

				var response = {
					dados_do_pagamento: pagamento,
					links: [
						{
							href: 'http://localhost:3000/pagamentos/pagamento/' + pagamento.id,
							rel: 'confirmar',
							method: 'PUT'
						},
						{
							href: 'http://localhost:3000/pagamentos/pagamento/' + pagamento.id,
							rel: 'cancelar',
							method: 'DELETE'
						},
					]
				}

				res.status(201).json(response);
			}
		});		
	});
}
}