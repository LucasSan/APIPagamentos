var soap = require('soap');

soap.createClient('http://ws.correios.com.br/calculador/CalcPrecoprazo.asmlx?wsdl',
	function(erro, cliente) {
		console.log('cliente soap criado');
		cliente.CalcPrazo({'nCdServico':'40010',
							'sCepOrigem':'04101300',
							'sCepDestino':'65000600'}, 
		
		function(err, resultado) {
			console.log(JSON.stringfy(resultado));
		});
	}
);