$(document).ready(function() {

/* Global Vars*/
debug_status = false;
$("#div_mesa").hide();

/* ------------------------------------------------------------------ 
|	Função para o Spinner de quantidade
------------------------------------------------------------------*/
spin = $("#qtd_spinner").spinner({
    min:1,
    max:50
});



/* ------------------------------------------------------------------ 
|	Preenche o select com os tipos de pratos cadastrados
------------------------------------------------------------------*/
$("#tipo").getTiposPratosSelect();
s2tp = $("#tipo").select2();

/*  Na medida em que o usuario escolhe o tipo do prato eu carrego
 *  apenas os pratos daquele tipo.
 */

s2tp.change(function(){
	 
	 $("#prato").empty();
	 $("#checks_variedades").empty();
 	tipo = parseInt($(this).select2("val"),10);

	$("#prato").getPratosSelect(tipo);
	
});

/* ------------------------------------------------------------------ 
|	Função para o Spinner de quantidade de Bebidas
------------------------------------------------------------------*/
spin2 = $("#qtd_spinner_bebida").spinner({
    min:1,
    max:50
});
/* ------------------------------------------------------------------ 
|	Preenche o select com os tipos de bebidas cadastrados
------------------------------------------------------------------*/
$("#bebidas").getBebidasSelect();
s2b = $("#bebidas").select2();

if(isEditableMode()){
/* ------------------------------------------------------------------ 
|	Funcao que carrega os dados de um pedido no modo de edicao
------------------------------------------------------------------*/
	loadStorageDataModeEdit();
}
else{
//Ao carregar o documento limpa o localstorage
clearPedido();
runTimeAndDate();

}

/* ------------------------------------------------------------------ 
|	Busca as variedades do prato no momento da seleção do select
| 	e controi os checkboxs na tela.
------------------------------------------------------------------*/
$("#prato").off("change").on("change",function(event) {

		cod_prato_selecionado = $(this).val();
		$.ajax({
		type: "GET",
		dataType:'json',
        url : pt_br.absolute_url+"/panel-control/pratos-variedades/pesquisar",
        data : {filtro:"pratos.cod",valor_buscado:cod_prato_selecionado}
    }).done(function(res){
    	
    	$("#checks_variedades").empty();
    	$.each(res,function(index, el) {
    		checkbox = '<div class="checkbox-inline">';
			checkbox += '<label>';
			checkbox += '<input type="checkbox" class="validar" value='+el.cod_variedade+'>'+el.variedade;
			checkbox += '<i class="fa fa-square-o small"></i>';
			checkbox += '</label>';
		    checkbox += '</div>';

    		$("#checks_variedades").append(checkbox);	
    	});
    });
});
/* ------------------------------------------------------------------ 
|	Formata o input para aceitar apenas valores integer
------------------------------------------------------------------*/
$(document).on("keyup",".integer",function(){
	 var expre = /[^0-9]/g;

    // REMOVE OS CARACTERES DA EXPRESSAO ACIMA
    if ($(this).val().match(expre))
        $(this).val($(this).val().replace(expre,''));
    value = parseInt($(this).val(),10);
    if(!Number.isNaN(value))
    $(this).val(value);
		
});
/* ------------------------------------------------------------------ 
|	Oculta ou Mostra os campos dos dados do cliente para pedidos
| 	Delivery ou não.
------------------------------------------------------------------*/
$(".pedido_tipo").change(function(){
	if($(this).val() == 1)
	{
		$("#dados_cliente").hide();
		$("#dados_cliente input").each(function(index, el) {
			$(this).attr("disabled",true);
		});
		$("#div_mesa").show();
		calculaTotal();
	}
	else
	{
		$("#dados_cliente").show();
		$("#dados_cliente input").each(function(index, el) {
			$(this).attr("disabled",false);
		});
		$("#div_mesa").hide();
		calculaTotal();
	}
})
/* ------------------------------------------------------------------ 
|	Faz o Autocomplete e ao selecionar o nome do cliente ja cadastrado
|	completa os outros campos com o restante dos dados
------------------------------------------------------------------*/
$("#cliente_auto").focusin(function(event) {
	$(this).getClientes();
});
$("#cliente_auto").on("autocompleteselect",function(event,ui){
	nome = ui.item.value;
	$.ajax({
		type: "GET",
		dataType:'json',
        url : pt_br.absolute_url+"/panel-control/clientes/editar",
        data : {nome:nome}
    }).done(function(res){
    	
    	$("#cod_cliente").val(res[0].cod);
    	$("input[name=endereco]").val(res[0].endereco);
    	$("input[name=telefone]").val(res[0].telefone);

    });
});
/* ------------------------------------------------------------------ 
|	Adiciona um item ao pedido
------------------------------------------------------------------*/
$("#add_item").off("click").on("click",function(){

	// valida o formulario para: Campos vazios ou senhas diferentes 
	var validation = $("#prato").val() == "" || s2tp.val() == "";
	if(validation)
	{
		alertErro(pt_br.campos_vazios);
		return false;
	}
	// valida se alguma variedade foi escolhida dos checkboxs
	var arr_variedades = [];
	var text_variedades = "";

	$("#checks_variedades .validar").each(function(index, el) {
		if($(this).is(":checked"))
		{
			arr_variedades.push(parseInt($(this).val(),10));
			text_variedades += $(this).parent("label").text()+" ";
		}
	});
	if(arr_variedades.length == 0)
	{
		alertErro(pt_br.msg_erro_selecione_variedades);
		return false;
	}


	codigo = parseInt($("#prato").val(),10);
	
	$.ajax({
		type: "GET",
		async: false,
		dataType:'json',
        url : pt_br.absolute_url+"/panel-control/pratos/editar",
        data : {codigo:codigo}
    }).done(function(res){
    	
    	$("#valor_prato_escolhido").val(res[0].valor);

    });

    /* Obtem o array de itens do localstorage */
	var arr_itens = JSON.parse(localStorage.getItem("itens"));
	if(arr_itens == null)
	{	// cria o array se não existir no localstorage
		arr_itens = [];
		cod_item = 1;
	}
	else{
		cod_item = arr_itens.length;
	}
		
	var item_obj = {};// objeto item 
	item_obj.cod_item = cod_item++;
	item_obj.cod_prato = codigo;
	item_obj.quantidade = parseInt($('#qtd_spinner').val(),10);
	item_obj.variedades = [];// array de variedades para um unico item

	for (var i = 0; i < arr_variedades.length; i++) {
		item_obj.variedades.push(arr_variedades[i]);
	};

	item_obj.adicionais = [];// array de adicionais de um unico item
	item_obj.totalAdicionais = 0.0; // valor total dos adicionais
	arr_itens.push(item_obj);

	if(debug_status) 
	{
		console.log("Array de Itens: LocalStorage");
		console.log(arr_itens);
	}
	localStorage.setItem("itens",JSON.stringify(arr_itens));
	
	var table_obj = {};// objeto para construir as linhas da tabela itens
	table_obj.cod_item = item_obj.cod_item;
	table_obj.cod_prato = item_obj.cod_prato;
	table_obj.prato = $("#prato option:selected").text();
	table_obj.qtd = item_obj.quantidade;
	table_obj.valor = $("#valor_prato_escolhido").val();
	table_obj.variedades = text_variedades;
	

	addRow(table_obj);
	if(debug_status)
	{
		console.log("Item Tabela Object");
		console.log(table_obj);
	}

	calculaTotal();
	
});
/* ------------------------------------------------------------------ 
|	Remove um item do pedido e corrige o localstorage
------------------------------------------------------------------*/
$(document).off("click",".remover").on("click",".remover",function(){

	cod_removido = parseInt($(this).parents("tr").children("td:eq(0)").attr("id"),10);
	// remove o item do localstorage

	var arr_itens = JSON.parse(localStorage.getItem("itens"));

	// corrige os ids na tabela
	var aux = cod_removido;
	$(this).parents("tr").fadeOut(200).remove();
	$("#itens_pedido tr").each(function(index, el) {
		cod = parseInt($(this).children('td:eq(0)').attr("id"),10);
		if(cod > cod_removido && cod <= arr_itens.length)
		{
			$(this).children('td:eq(0)').attr("id",aux);
			aux++;
		}		
	});
	
	var tmp = [];
	j = 1;
	for (var i = 0; i < arr_itens.length; i++) {
		if(arr_itens[i].cod_item != cod_removido)
		{
			arr_itens[i].cod_item = j++;
			tmp.push(arr_itens[i]);
			
		}
	};

	if(debug_status) 
	{
		console.log("Array tmp removido do localStorage");
		console.log(tmp);
	}
	localStorage.setItem("itens",JSON.stringify(tmp));
	
	calculaTotal();

});
/* ------------------------------------------------------------------ 
|	Limpa todos os itens do pedido e também o localstorage
------------------------------------------------------------------*/
$("#limpar_itens").on("click",function(){

	$("#itens_pedido").empty();
	cod_item = 1;
	//limpa o localstorage
	clearLocalStorage();
	calculaTotal();
});
/* ------------------------------------------------------------------ 
|	Abre as opções de adicionais para o prato selecionado, de modo
|	que o usuario poderá montar o prato da maneira que quiser.
------------------------------------------------------------------*/
$(document).off("click",".detalhes").on("click",".detalhes",function(){

	$("#detalhes").modal("show");
	var cod_prato = parseInt($(this).parents("tr").children("td:eq(0)").attr("cod_prato"),10);
	$("#cit").val(parseInt($(this).parents("tr").children("td:eq(0)").attr("id"),10));
	$.ajax({

    type: "GET",
    async: false,
    url : pt_br.absolute_url+"/panel-control/pedidos/detalhes",
    data : {cod_prato:cod_prato},
    dataType: 'json'
    }).done(function(res){
    	nome_prato = $(this).parents("tr").children("td:eq(0)").text();
    	$("#titulo_modal").html("<b style='color:#d15e5e;'>"+nome_prato.toUpperCase()+"</b>");
    	addRowAdicional(res);
    	loadAdicionaisSalvos(parseInt($("#cit").val(),10));
    });
});
/* ------------------------------------------------------------------ 
|	Faz a seleção de todos os valores de adicionais de acordo com
|	a linha da categoria escolhida
------------------------------------------------------------------*/
$(document).on("click",".all",function(){
	cod_categoria = parseInt($(this).parents("tr").attr("cod_categoria"),10);
	
	table = $("#ct"+cod_categoria+" .selecionado:not(:disabled)");

	if ($(this).is(':checked'))  
		table.prop('checked', true);
    else 
    	table.prop('checked', false);
});

/* ------------------------------------------------------------------ 
|	Limita a quantidade de checkbox de adicionais de acordo com
|	o limite da categoria daqueles adicionais.
------------------------------------------------------------------*/
$(document).on("click",".selecionado",function(){
	limite  = parseInt($(this).parents("td").attr("limite"),10);
	cct = parseInt($(this).parents("td").attr("cct"),10);

	if(debug_status)
		console.log("limite = "+limite);

	checks = $("#ct"+cct).find("input[type=checkbox]:checked");
	
	if(checks.length > limite && limite != -1)
	{
		alertWarning(pt_br.msg_erro_limite);
		$(this).attr("checked",false);
	}
	checks_ = $("#ct"+cct).find("input[type=checkbox]");
	if(checks.length < checks_.length)
	{
		tr = $("tr[cod_categoria="+cct+"]");
		if(tr.has(".all").length)
		{
			tr.find(".all").prop("checked",false);
		}
	}
	if(checks.length == checks_.length)
	{
		tr = $("tr[cod_categoria="+cct+"]");
		if(tr.has(".all").length)
		{
			tr.find(".all").prop("checked",true);
		}
	}

});
/* ------------------------------------------------------------------ 
|	Salva as opções de adicionais escolhidas no LocalStorage
------------------------------------------------------------------*/
$("#salvar_adicionais").off("click").on("click",function(){

	var adc = [];
	cit = $("#cit").val();// codigo do item
	var totalAdicionais = 0.0;
	$(".selecionado").each(function(index, el) {
			if($(this).is(":checked")){
				adc.push(parseInt($(this).val(),10));
				totalAdicionais += parseFloat($(this).parents("tr").children("td:eq(2)").text());
			}
	});
	
	var arr_itens = JSON.parse(localStorage.getItem("itens"));
	
	$.each(arr_itens,function(index, el) {
		if(el.cod_item == cit)
		{
			el.adicionais = adc;
			el.totalAdicionais = totalAdicionais;
		}	
	});

	if(debug_status)
	{
		console.log("Array de item com adicionais para o item: "+cit);
		console.log(arr_itens);
	}

	localStorage.setItem("itens",JSON.stringify(arr_itens));
	calculaTotal();
	$("#detalhes").modal("hide");
	

});
/* ------------------------------------------------------------------ 
|	Faz a solicitação do pedido
------------------------------------------------------------------*/
$("#salvar_pedido").off("click").on("click",function(){

	// validações
	tipo_pedido = $(".pedido_tipo:checked").val();
	if(tipo_pedido == 0)
	{
		// Tipo do pedido é Entrega
		if($("#cadastro_pedido .required").validation())
		{
			alertErro(pt_br.campos_vazios);
			return false;
		}

	}
	else
	{
		// Tipo do pedido é Mesa
		if($("input[name=nro_mesa]").val() == "")
		{
			alertErro(pt_br.msg_erro_mesa);
			return false;
		}
	}
	// se Existe pelo menos um item no pedido
	if($("#itens_pedido tr").length == 0)
	{
		alertErro(pt_br.msg_erro_itens);
		return false;
	}

	pedido = {};
	if($("#cod_cliente").val() != "")
	{
		pedido.cod_cliente = parseInt($("#cod_cliente").val(),10);
	}
	pedido.cliente = $("input[name=nome]").val();
	pedido.endereco = $("input[name=endereco]").val();
	pedido.telefone = $("input[name=telefone]").val();
	pedido.tipo_pedido = tipo_pedido;

	pedido.data_pedido = $("#data").val();
	pedido.horario = $("#horario").val();
	pedido.nro_mesa = parseInt($("select[name=nro_mesa]").val(),10);
	pedido.valor_total = parseFloat($("#total").text());
	pedido.origem = 1;
	pedido.observacoes = $("textarea[name=observacoes]").val();
	pedido.itens = JSON.parse(localStorage.getItem("itens"));
	
	var ls_bebidas = JSON.parse(localStorage.getItem("bebidas"));
	if(Array.isArray(ls_bebidas))
		pedido.bebidas = ls_bebidas;
	
	var url = pt_br.absolute_url;
	
	if($("#editable").val() != 0){
		pedido.cod_pedido = parseInt($("#editable").val(),10);

		url += "/panel-control/pedidos/editar";
	}
	else{
		url += "/panel-control/pedidos/cadastro";
	}
	
	$.ajax({

    type: "POST",
    url : url,
    data : {pedido:pedido}
    }).done(function(res){
    	
    	if(parseInt(res,10) == 1)
    	{
	    	alertSucesso(pt_br.msg_cadastro_sucesso);
	    	clearPedido();
    	}
    	else if(parseInt(res,10) == 0)
    	{
    		alertErro(pt_br.msg_cadastro_erro);
    	}
    });

    // clearLocalStorage();
	if(debug_status)
	{
		console.log("#Obj Pedido");
		console.log(pedido);
	}
});

$("#add_bebida").off("click").on("click",function(){


	codigo = parseInt($("#bebidas").val(),10);
	
	// adiciona as bebidas no LocalStorage
    var arr_bebidas = JSON.parse(localStorage.getItem("bebidas"));
    if(arr_bebidas == null)
	{	// cria o array
		arr_bebidas = [];
	}

    for (var i = 0; i < arr_bebidas.length; i++) {
    	if(arr_bebidas[i].cod == codigo)
    	{
    		alertWarning(pt_br.msg_erro_item_bebida_duplicado);
    		return false;
    	}
    };

	$.ajax({
		type: "GET",
		async: false,
		dataType:'json',
        url : pt_br.absolute_url+"/panel-control/bebidas/editar",
        data : {codigo:codigo}
    }).done(function(res){
    	
		linha = "<tr>";
    	linha += "<td id="+res[0].cod+">"+res[0].nome+"</td>";
    	linha += "<td >R$ <span>"+res[0].valor+"</span></td>";
    	qtd_bebida = parseInt($("#qtd_spinner_bebida").val(),10);
    	linha += "<td >"+qtd_bebida+"</span></td>";
    	linha += '<td><a href="#remover_" class="remover_bebida"><i class="fa fa-times"></i></a>&nbsp;&nbsp;</td>'
    	linha += "</tr>";

    	$("#itens_bebida").append(linha);
    	
    	calculaBebidas();

		item_bebida = {};
		item_bebida.cod = res[0].cod;
		item_bebida.quantidade = qtd_bebida;

		arr_bebidas.push(item_bebida);
		localStorage.setItem("bebidas",JSON.stringify(arr_bebidas));

    });


});


$(document).off("click",".remover_bebida").on("click",".remover_bebida",function(){

		codigo = parseInt($(this).parents("tr").children('td').attr("id"),10);

		$(this).parents("tr").remove();
		var arr_bebidas = JSON.parse(localStorage.getItem("bebidas"));
		var tmp = [];
		$.each(arr_bebidas,function(index, item) {
			if(item.cod != codigo)
				tmp.push(item);
			
		});

		localStorage.setItem("bebidas",JSON.stringify(tmp));

		calculaBebidas();

});

$("#limpar_bebidas").on("click",function(){
		$("#itens_bebida").empty();
		localStorage.removeItem("bebidas");
		calculaBebidas();
});

/* ------------------------------------------------------------------ 
|	Limpar os campos do formulario
------------------------------------------------------------------*/
$("#cancelar").on("click",function(){
	clearPedido();
});
/**
* Active Debug Log
*/
	
});

function calculaBebidas()
{

		valor = 0;
		qtd_bebida = parseInt($("#qtd_spinner_bebida").val(),10);
    	$("#itens_bebida tr").each(function(index, el) {
			valor += (parseFloat($(this).children('td:eq(1)').children('span').text()) * qtd_bebida);
    	});
    	$("#valor_bebidas").text(valor.toFixed(2));
    	total = parseFloat($("#total_itens").text()) + parseFloat($("#valor_bebidas").text());
    	$("#total").text(total.toFixed(2));
}
function clearLocalStorage(){
	localStorage.removeItem("itens");
	localStorage.removeItem("bebidas");
}
function clearPedido()
{
	$("#radio-box").show();
	$("#editable").val(0);
	$("#dados_cliente input").each(function(index, el) {
		$(this).val("").removeAttr("readonly");		
	});
	$("#prato").val("");
	$("#checks_variedades").empty();
	$("#qtd_spinner").val(1);
	$("#idp").prop("checked",true);
	$("#itens_pedido").empty();
	$("#itens_bebida").empty();
	s2b.val("");
	$("#total_itens").text("0.00");
	$("#valor_bebidas").text("0.00");
	$("#total").text("0.00");
	$("textarea[name=observacoes]").val("");
	clearLocalStorage();
	runTimeAndDate();

}
/* ------------------------------------------------------------------ 
|	Função que constroi a tabela e as categorias dos adicionais
|	para o usuario montar o pedido do cliente no sistema.
------------------------------------------------------------------*/
function addRowAdicional(obj){

	var arr_categorias = obj.categorias;
	var arr_adicionais = obj.adicionais;

	$("#itens_adicionais").empty();
	$.each(arr_categorias, function(index, el) {
		linha = "<tr class='row-categoria' cod_categoria = '"+el.cod_categoria+"'>";

		

		linha += "<td>"+el.nome+"</td>";
		if(el.limite == -1)
		{
			linha += '<td style="width:65px;" limite="-1">';
			linha += '<div class="checkbox"><label><input type="checkbox" class="all"><i class="fa fa-square-o small"></i></label></div>';
			linha += '</td>';
		}
		else
			linha += "<td>"+el.limite+"</td>";
		linha += "</tr>";

		$("#itens_adicionais").append(linha);

		// constroir a parte dos adicionais da categoria acima

		table =  '<tr><td colspan="3"><table class="table table-striped" id="ct'+el.cod_categoria+'">';
		table += '<tbody>';

		if(debug_status)
		{
			console.log("Array de Adicionais");
			console.log(arr_adicionais);
		}
		$.each(arr_adicionais,function(i, it) {

			if(it.cod_categoria == el.cod_categoria)
			{
				table += "<tr class='line_adicionais'>";
				// primeira coluna foto adicional
				if(it.foto_url != null)
				{
					table += "<td style='width:65px;'><a class='fancybox' rel='gallery1' href='"+it.foto_url+"'>";
					table += "<img src='"+it.foto_url+"' alt='"+it.foto_url+"'/>";
					table += "</a></td>";
				}
				else
					table += "<td style='width:65px;><img class='nophoto' src='../img/noimage.png'/></td>";
				// segunda coluna nome adicional(Produto)
				table += "<td>"+it.nome+"</td>";
				table += "<td>"+parseFloat(it.valor).toFixed(2)+"</td>";
				
				table += '<td style="width:65px;" limite='+el.limite+' cct = '+el.cod_categoria+'>';
				table += '<div class="checkbox"><label><input type="checkbox" class="selecionado" value='+it.cod+'><i class="fa fa-square-o small"></i></label>';
				table += '</div></td>';
				
				table += "</tr>";


			}//fim do if 


		});// fim do each para adicionais


		table += '</tbody>';
		table += '</table></td></tr>';

		$("#itens_adicionais").append(table);


	});

}
function addRow(item)
{

		linha = '<tr >';
		linha += "<td id="+item.cod_item+" cod_prato="+item.cod_prato+">"+item.prato.toUpperCase()+"</td>";
		linha += "<td>"+item.qtd+"</td>";
		valor = parseFloat(item.valor) * item.qtd;
		linha += "<td>"+"R$ <span>"+parseFloat(item.valor).toFixed(2)+"</span></td>";
		linha += "<td>"+"R$ <span>"+valor.toFixed(2)+"</span></td>";
		linha += "<td>"+"<small>"+item.variedades+"</small></td>";
		linha += '<td><a href="#detalhes" data-toggle="modal" data-target="#detalhes" class="detalhes"><i class="fa fa-eye"></i></a>';
		linha += '&nbsp;&nbsp;<a href="#remover" class="remover"><i class="fa fa-times"></i></a>&nbsp;&nbsp;</td>';
		linha += "</tr>";

		$("#itens_pedido").append(linha);
}
function loadAdicionaisSalvos(cod_item)
{
	var itens = JSON.parse(localStorage.getItem("itens"));
	
	var tmp_item = {};
	$.each(itens,function(index, it) {
		if(it.cod_item == cod_item)
		{
			tmp_item = it;

		}
	});
	
	$("#itens_adicionais .selecionado").each(function(){
		check = $(this);
		
		$.each(tmp_item.adicionais,function(ind, cad) {
			
			if(parseInt(check.val(),10) == cad)
			{
				check.prop("checked",true);
				return false;
			}

		});

	})
		
}
function calculaTotal(){
	// Calcula o valor total de acordo com o tipo do pedido
	total_pedido = 0.00;

	$("#itens_pedido tr").each(function(index, el) {

		total_pedido += parseFloat($(this).children('td:eq(3)').children("span").text());	
	});
	tipo_pedido = $(".pedido_tipo:checked").val();

	if(localStorage.getItem("itens") != null){
		arr_itens = JSON.parse(localStorage.getItem("itens"));
		$.each(arr_itens,function(k,v){
			total_pedido += (v.totalAdicionais * v.quantidade);
		});
	}
		
	
	$("#total_itens").text(total_pedido.toFixed(2));
	total = parseFloat($("#total_itens").text()) + parseFloat($("#valor_bebidas").text());
	$("#total").text(total.toFixed(2));
}

function loadStorageDataModeEdit(){

		var dados = JSON.parse(localStorage.getItem("editDataPedido"));
		$("#editable").val(dados.cod_pedido);

		$(".pedido_tipo").removeAttr("checked");
		$("#radio-box").hide();
		if(dados.hasMesa){
			$(".pedido_tipo:eq(1)").prop("checked",true);
			$("#dados_cliente").hide();
			$("#dados_cliente input").each(function(index, el) {
				$(this).attr("disabled",true);
			});
			setTimeout(function(){
				$("#nro_mesa").val(dados.nro_mesa).prop("readonly",true);;
			},50);

			$("#div_mesa").show();
			
		}else{
			
			$(".pedido_tipo:eq(0)").prop("checked",true);
			$("#cod_cliente").val(dados.cod_cliente).prop("readonly",true);
			$("#cliente_auto").val(dados.cliente).prop("readonly",true);;
			$("#endereco").val(dados.endereco).prop("readonly",true);;
			$("#telefone").val(dados.telefone).prop("readonly",true);;
			$("#dados_cliente input").each(function(index, el) {
				$(this).attr("disabled",false);
			});
			$("#dados_cliente").show();
			$("#div_mesa").hide();
		}

		$("#data").val(dados.data);
		$("#horario").val(dados.horario);

		var arr_itens = [];
		var cod_item = 1;
		$.each(dados.itens,function(k,v){

			var item_obj = {};// objeto item 
			item_obj.cod_item = cod_item;
			item_obj.cod_prato = v.cod_prato;
			item_obj.quantidade = v.quantidade;
			item_obj.variedades = [];// array de variedades para um unico item

			$.each(v.variedades,function(k2,variedade){
				item_obj.variedades.push(variedade.cod);
			});

			item_obj.adicionais = v.adicionais;
			item_obj.totalAdicionais = v.totalAdicionais; // valor total dos adicionais
			arr_itens.push(item_obj);
			// adicionando as linhas da tabela de pratos

			var table_obj = {};// objeto para construir as linhas da tabela itens
			table_obj.cod_item = cod_item++;
			
			table_obj.cod_prato = v.cod_prato;
			table_obj.prato = v.prato;
			table_obj.qtd = v.quantidade;
			table_obj.valor = v.valor;
			table_obj.variedades = "";

			$.each(v.variedades,function(k2,variedade){
				table_obj.variedades += variedade.nome + " ";
			});
			addRow(table_obj);

		});
		var arr_bebidas = [];

		$.each(dados.bebidas,function(k,bebida){

			linha = "<tr>";
	    	linha += "<td id="+bebida.cod+">"+bebida.nome+"</td>";
	    	linha += "<td >R$ <span>"+bebida.valor+"</span></td>";
	    	linha += "<td >"+bebida.quantidade+"</span></td>";
	    	linha += '<td><a href="#remover_" class="remover_bebida"><i class="fa fa-times"></i></a>&nbsp;&nbsp;</td>'
	    	linha += "</tr>";

	    	$("#itens_bebida").append(linha);
	    	
	    	item_bebida = {};
			item_bebida.cod = bebida.cod;
			item_bebida.quantidade = bebida.quantidade;

			arr_bebidas.push(item_bebida);
			calculaBebidas();
			
		});
		$("#observacoes").text(dados.observacoes);
		localStorage.setItem("bebidas",JSON.stringify(arr_bebidas));		
		localStorage.setItem("itens",JSON.stringify(arr_itens));
		localStorage.removeItem("editDataPedido");

		calculaTotal();
}

function isEditableMode(){
	return (localStorage.getItem("editDataPedido") != null && localStorage.getItem("editDataPedido") != "");
}
function runTimeAndDate(){
/* ------------------------------------------------------------------ 
|	Funções para o DatePicker e TimePicker do Jquery UI
------------------------------------------------------------------*/
	$("#data").val(today());
	$("#horario").val(getHorario());
	setInterval(function(){
		$("#horario").val(getHorario());
	},1000);
}

function debug(){
	debug_status = true;
}

